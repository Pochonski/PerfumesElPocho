---
name: frontend-design
description: Produces production-grade UI in this repo's exact stack - Tailwind v4, Geist, Phosphor icons, Framer Motion, Lenis. Use when building, redesigning, or polishing any component, page, layout, or visual feature. Trigger on phrases like "make it look better", "production quality", "modern UI", "improve the design", "redesign this page", or any task that touches React components, styling, or layout.
---

# Frontend Design (Perfumes El Pocho)

Skill adapted from `anthropics/claude-plugins-official/frontend-design`. Codifies the design language, stack conventions, and anti-patterns for this repo so generated UI doesn't look "AI-generic".

## Before you write a single line of UI

1. **Read `web/AGENTS.md`** — this project uses Next.js 15.5.19 / Next 16 conventions that differ from training data. Read `web/node_modules/next/dist/docs/` for the relevant guide before touching routing, data fetching, server components, or metadata.
2. **Read existing components** — `web/src/components/{ui,sections,product,filters,providers}`. Match their patterns. Don't invent a new visual language.
3. **Check the user's actual ask** — "improve the design" can mean (a) fix one specific thing, (b) full redesign. Use `question` if ambiguous.

## The stack (use these, not alternatives)

| Concern | Tool | Notes |
|---|---|---|
| Styling | **Tailwind v4** | Config via `@theme` in CSS, NOT `tailwind.config.js`. Use `@import "tailwindcss"` |
| Font | **Geist** | Already loaded; use `font-sans` / `font-mono` |
| Icons | **`@phosphor-icons/react`** | Import named icons: `import { MagnifyingGlass } from "@phosphor-icons/react"` |
| Animation | **`framer-motion`** | Use `motion.*` components; respect `prefers-reduced-motion` |
| Smooth scroll | **`lenis`** | Already wired in providers — don't reinitialize |
| Forms/validation | **`zod`** | For any new schema |
| React | **19.2.4** | Server components by default; `"use client"` only when needed |

## Design language for this product

The product is a perfume catalog. Audience: Spanish-speaking, Costa Rica, mid-market price range. Aesthetic target: **boutique / editorial / quiet luxury** — not generic e-commerce, not flashy.

**Visual rules:**

- **Color**: restrained. Off-white / cream backgrounds, deep charcoal text, ONE accent color used sparingly. The current palette uses neutral tones with one warm accent — match it.
- **Type**: generous sizing on hero/headings, comfortable reading sizes for body. Geist is geometric and modern — pair display weights with regular body weights. Avoid italics in UI labels.
- **Spacing**: airy. Tailwind scale-4 to scale-12 between sections. Cards need breathing room; don't tile them edge-to-edge.
- **Imagery**: full-bleed where possible. Products are hero — let images carry the page. Avoid stock illustrations or AI-looking hero scenes.
- **Motion**: subtle. Page transitions: 150-300ms ease. Scroll reveals: opacity + small Y offset, never huge. Hover states: 100-150ms. NO bounce, NO spring overshoot on critical UI.
- **Borders & shadows**: prefer borders (1px, low-contrast) over shadows. Shadows only for elevated layers (modals, popovers).

**Copy:**

- Spanish for user-facing strings. Code, comments, identifiers stay English.
- Short, concrete. No marketing fluff ("¡Experimenta la magia!"). The product sells through clarity.
- Prices formatted with `₡` and thousands separator: `₡12,500` (use the existing `format.ts` helpers if present).

## Component patterns to follow

Before writing a new component, scan these:

- `web/src/components/ui/` — primitives (button, input, badge, etc.)
- `web/src/components/sections/` — page sections (hero, catalog, filters)
- `web/src/components/filters/` — filter-specific components
- `web/src/components/providers/` — context providers

If a primitive exists, **use it**. If you need a new primitive, add it to `ui/` with the same conventions, then use it everywhere.

## Interaction details that matter

- **Loading states**: skeleton or shimmer, not spinners on full-page loads. Spinners are OK for <1s actions only.
- **Empty states**: an illustration or icon + one line of copy + one CTA. Never a blank page.
- **Errors**: surface them in context (inline for forms, toast for actions), not as alert dialogs for everything.
- **Focus states**: visible and high-contrast. Default browser focus is too quiet on light backgrounds.
- **Touch targets**: minimum 44×44px. Padding before icon-only buttons.
- **Images**: always specify `width`/`height` to avoid CLS. Use `next/image` for product photos.

## Responsive

Mobile-first. Test at 375px (small phone), 768px (tablet), 1280px (desktop), 1536px (wide).

Layout breakpoints per Tailwind defaults: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`.

Use container queries (`@container`) for component-level responsiveness instead of viewport-based breakpoints when the layout depends on a parent card or sidebar.

## Accessibility checklist (run before claiming done)

- [ ] Color contrast ≥ 4.5:1 for body, ≥ 3:1 for large text
- [ ] All interactive elements keyboard-reachable, with visible focus
- [ ] Images have meaningful `alt` (or empty `alt=""` for decorative)
- [ ] Form fields have associated labels
- [ ] Modals/dialogs trap focus and close on `Esc`
- [ ] No motion for users with `prefers-reduced-motion: reduce`

## Anti-patterns to refuse

- **Generic AI hero**: "Transform your [thing] with our [thing]" + abstract gradient
- **Purple-to-blue gradient** on everything
- **Card grid with rounded-2xl + shadow-xl on every item**
- **Three-column "feature grid" with icon + title + 1 line** — this is the AI tell
- **Carousel as default** — only when content warrants it
- **Placeholder copy**: "Lorem ipsum", "Title here", "Description goes here"
- **Made-up numbers**: "10,000+ customers" — don't fabricate

## Reporting back

When done, show:

1. The files changed (with one-line intent each)
2. The build/typecheck/lint output if available
3. A note on accessibility and responsive testing you did
4. Anything you deliberately skipped and why

Do NOT narrate the design process or explain design theory. The code is the answer.