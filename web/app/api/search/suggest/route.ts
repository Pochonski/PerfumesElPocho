import { NextResponse, type NextRequest } from "next/server";
import { getProductos, normalizeText } from "@/lib/productos";

export const dynamic = "force-dynamic";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 240;

function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

interface Suggestion {
  id: number;
  nombre: string;
  marca: string;
  precio: number;
  imagen: string | null;
}

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  const limitRaw = parseInt(request.nextUrl.searchParams.get("limit") || "6", 10);
  const limit = isNaN(limitRaw) ? 6 : Math.max(1, Math.min(8, limitRaw));

  if (q.length < 2) {
    return NextResponse.json(
      { items: [], total: 0, query: q },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "X-RateLimit-Remaining": String(remaining),
        },
      }
    );
  }

  const needle = normalizeText(q);
  const productos = getProductos();

  const matches: { p: typeof productos[number]; score: number }[] = [];
  for (const p of productos) {
    const nombreN = normalizeText(p.nombre);
    const marcaN = normalizeText(p.marca);

    if (nombreN.startsWith(needle)) {
      matches.push({ p, score: 0 });
    } else if (marcaN && marcaN.startsWith(needle)) {
      matches.push({ p, score: 1 });
    } else if (nombreN.includes(needle)) {
      matches.push({ p, score: 2 });
    } else if (marcaN && marcaN.includes(needle)) {
      matches.push({ p, score: 3 });
    } else {
      const fam = normalizeText(p.familia_olfativa);
      const conc = normalizeText(p.concentracion);
      if (fam.includes(needle) || conc.includes(needle)) {
        matches.push({ p, score: 4 });
      }
    }
  }

  matches.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.p.nombre.localeCompare(b.p.nombre);
  });

  const items: Suggestion[] = matches.slice(0, limit).map(({ p }) => ({
    id: p.id,
    nombre: p.nombre,
    marca: p.marca,
    precio: p.precio,
    imagen: p.imagenes?.[0] || null,
  }));

  return NextResponse.json(
    { items, total: matches.length, query: q },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-RateLimit-Remaining": String(remaining),
      },
    }
  );
}
