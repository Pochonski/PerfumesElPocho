# 0004 — Security review (adversarial pass)

**Date:** 2026-06-30
**Status:** accepted
**Context:** Adapted from `anthropics/claude-code-security-review`. A single security-auditor subagent audited the project as an attacker would, after the F1-F5 code-review sweep. Threat model: **public internet, no auth, no PII, no checkout, public catalog browsing only.**

## Initial verdict
`BLOCK` due to one CRITICAL finding (stored XSS via JSON-LD in product 998) and one HIGH finding (unbounded Zod strings on `/api/productos` enabling cheap DoS).

## Findings & resolutions

### S1 [CRITICAL] — Stored XSS via JSON-LD
**File:** `web/src/data/productos.json` (id 998) + `web/app/producto/[id]/page.tsx`

Product 998 ("ODYSSEY BAHAMAS UNISEX 100ML EDP ARMAF") had a raw `<script async src="https://www.tiktok.com/embed.js"></script>` snippet scraped from `essenzaperfumes.cr`. This was emitted verbatim into `<script type="application/ld+json">` via `JSON.stringify(...)`. `JSON.stringify` does not escape `</script>` inside string literals — the embedded closing tag terminates the JSON-LD `<script>`, and the parser then treats the remainder as HTML, executing the TikTok embed on the user's session.

**Fixes applied (defense in depth):**
- **Source:** scrubbed `<script>...</script>` and orphan `<script ...>` from `web/src/data/productos.json`. Verified 0 remaining script tags, `</script>`, `<iframe`, `<object`, `<embed`, `<!--`, `javascript:`, `onerror=`, `onload=`.
- **Render:** created `web/src/lib/json-ld.ts` with `serializeJsonLd(value)` that does `JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029")`. Applied at all 5 JSON-LD sites: `app/page.tsx`, `app/producto/[id]/page.tsx`, `app/categoria/[slug]/page.tsx`, `app/marca/[slug]/page.tsx`, `app/guias/[slug]/page.tsx`.

### S2 [HIGH] — DoS via unbounded Zod strings
**Files:** `web/app/api/productos/route.ts`, `web/app/api/search/suggest/route.ts`

The Zod schemas declared every string param as `z.string().optional()` with no `.max()`. An attacker could send `?q=<1MB of A>` and the server would do O(N×products) work per request.

**Fixes applied:**
- Added `.max()` constraints to all string fields (`categoria`: 120, list fields: 2000, `q`: 200)
- Added regex patterns for numeric fields: `precioMin`/`precioMax`: `/^\d{1,9}(\.\d{1,2})?$/`; `page`: `/^\d{1,5}$/`; `perPage`: `/^\d{1,3}$/`
- Constrained `sort` to a Zod enum instead of free-form string
- Rewrote `/api/search/suggest/route.ts` to use a Zod schema (was previously raw `parseInt` with no validation)

### S3 [MEDIUM] — Unbounded rate-limit `Map`
**File:** `web/src/lib/rate-limit.ts`

Module-level `Map<string, ...>` with no eviction → slow memory leak. Also trusted `x-forwarded-for` blindly, allowing header spoofing.

**Fixes applied:**
- `MAX_ENTRIES = 10_000` cap. When the cap is exceeded, sweep expired entries first, then evict oldest (insertion order) until under cap
- `getClientIP` now prefers `x-vercel-forwarded-for` (Vercel's trusted header), then falls back to `x-forwarded-for`, then `x-real-ip`

### S4 [MEDIUM] — npm audit: 3 moderate transitive vulnerabilities
**Files:** `web/package.json`, `web/package-lock.json`

`npm audit --prefix web` reported:
- `geist@1.0.1-1.3.0` (moderate, via next)
- `next@9.3.4-canary.0 - 16.3.0-canary.5` (moderate, via postcss)
- `postcss <8.5.10` (CWE-79 XSS via unescaped `</style>` in CSS stringifier)

**Fix applied:**
- Added `"postcss": "^8.5.10"` to `overrides` in `web/package.json`
- Ran `npm install` to update the lockfile
- Re-ran `npm audit` → **0 vulnerabilities**

### S5 [MEDIUM] — No web response hardening headers
**Status:** **resolved.**

Added `web/middleware.ts` (34.3 kB compiled, ~30 lines source). Sets on every matched request:
- `Content-Security-Policy`: `default-src 'self'; img-src 'self' data: blob: https://3pspglobal.s3.us-east-2.amazonaws.com https://pub-e703132c460246adacce3867fb9ccf24.r2.dev; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`

Matcher excludes `_next/static`, `_next/image`, `favicon.ico`, `robots.txt`, `sitemap.xml`, and image extensions (no headers needed on static assets).

Notes on trade-offs:
- `'unsafe-inline'` in `script-src` is required because the theme-flash script (`app/layout.tsx`) and all JSON-LD `<script>` tags use `dangerouslySetInnerHTML`. A nonce-based CSP would require nonces on every inline script — out of scope here.
- `'unsafe-inline'` in `style-src` is required by Tailwind v4 dynamic utilities and Framer Motion.
- `'self'` for `frame-ancestors` + `X-Frame-Options: DENY` is the modern + legacy double-clickjacking defense.

### LOW / confirm-only
- `Object.fromEntries(searchParams.entries())` behavior on duplicate keys — well-defined, no risk
- `scraper/scraper.py` SSRF — out of scope (developer-only tool, not deployed)
- `web/src/lib/productos.ts` module-level mutation of cached array — single-threaded Node, safe
- `web/src/lib/logger.ts` `console.warn(scope, err)` — server-only console, no PII (no PII is collected)
- `web/next.config.ts` R2 `pathname: "/**"` — bucket only holds scraped product images, low risk

## Verification
- `npx tsc --noEmit` → 0 errors
- `npx next build` → 620 static pages, clean
- `npm audit --prefix web` → **0 vulnerabilities**

## Backlog (deferred)
- Pin `requests>=2.32.4` in `scraper/requirements.txt` (Python env not available locally to run `pip-audit`)
- Consider `pathname: "/products/**"` (narrower) on the R2 bucket in `web/next.config.ts` if bucket usage ever grows
- Tighten CSP: switch inline scripts to nonce-based to remove `'unsafe-inline'` from `script-src`

## Related decisions
- `0001-opencode-skills-setup.md` — workflow tooling
- `0002-code-review-fixes.md` — code review sweep that produced the surfaces reviewed here
- `0003-code-review-backlog.md` — non-security tech debt backlog