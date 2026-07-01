import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getProductos, normalizeText } from "@/lib/productos";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const SuggestSchema = z.object({
  q: z.string().min(1).max(200),
  limit: z
    .string()
    .regex(/^\d{1,2}$/)
    .transform((v) => {
      const n = parseInt(v, 10);
      if (isNaN(n)) return 6;
      return Math.max(1, Math.min(8, n));
    })
    .optional(),
});

interface Suggestion {
  id: number;
  nombre: string;
  marca: string;
  precio: number;
  imagen: string | null;
}

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  const { allowed, remaining } = checkRateLimit(ip, { windowMs: 60_000, max: 240 });
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = SuggestSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { items: [], total: 0, query: "" },
      {
        status: 400,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "X-RateLimit-Remaining": String(remaining),
        },
      }
    );
  }

  const q = parsed.data.q.trim();
  const limit = parsed.data.limit ?? 6;

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