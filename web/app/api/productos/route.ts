import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getProductos,
  normalizeText,
  type Producto,
} from "@/lib/productos";

export const dynamic = "force-static";
export const revalidate = 3600;

/* ─── Rate Limiting ─── */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetIn: entry.resetAt - now };
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

/* ─── Zod Schema for Search Params ─── */
const SearchParamsSchema = z.object({
  categoria: z.string().optional(),
  marcas: z.string().optional(), // comma-separated
  familias: z.string().optional(),
  ocasiones: z.string().optional(),
  generos: z.string().optional(),
  precioMin: z.string().optional(),
  precioMax: z.string().optional(),
  q: z.string().optional(),
  sort: z.string().optional(), // precio-asc | precio-desc | nombre-asc
  page: z
    .string()
    .transform((v) => {
      const n = parseInt(v, 10);
      return isNaN(n) || n < 1 ? 1 : n;
    })
    .default("1"),
  perPage: z
    .string()
    .transform((v) => {
      const n = parseInt(v, 10);
      if (isNaN(n) || n < 1) return 24;
      return n > 48 ? 48 : n;
    })
    .default("24"),
});

function parseSearchParams(raw: NextRequest["nextUrl"]["searchParams"]): {
  params: z.infer<typeof SearchParamsSchema> & { page: number; perPage: number };
  errors: string[];
} {
  const rawObj = Object.fromEntries(raw.entries());
  const result = SearchParamsSchema.safeParse(rawObj);

  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    const fallback = { categoria: undefined, marcas: undefined, familias: undefined, ocasiones: undefined, generos: undefined, precioMin: undefined, precioMax: undefined, q: undefined, sort: undefined, page: 1, perPage: 24 };
    return { params: fallback as typeof fallback & { page: number; perPage: number }, errors };
  }

  return { params: result.data as any, errors: [] };
}

/* ─── Response Types ─── */
interface ApiProducto extends Omit<Producto, "imagenes"> {
  imagen: string | null;
}

interface ApiResponse {
  items: ApiProducto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  errors?: string[];
}

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  const { allowed, remaining, resetIn } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      {
        error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos.",
        retryAfter: Math.ceil(resetIn / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(resetIn / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const { params, errors } = parseSearchParams(request.nextUrl.searchParams);

  let filtered: Producto[] = getProductos();

  // Filter by categoria
  if (params.categoria && params.categoria !== "Todos") {
    filtered = filtered.filter((p) => p.categorias.includes(params.categoria!));
  }

  // Filter by marcas (comma-separated, OR logic)
  if (params.marcas) {
    const marcaList = params.marcas.split(",").map((m) => normalizeText(m.trim())).filter(Boolean);
    if (marcaList.length > 0) {
      filtered = filtered.filter((p) => marcaList.includes(normalizeText(p.marca)));
    }
  }

  // Filter by familias olfativas (OR logic)
  if (params.familias) {
    const familiaList = params.familias.split(",").map((f) => normalizeText(f.trim())).filter(Boolean);
    if (familiaList.length > 0) {
      filtered = filtered.filter((p) =>
        p.familias_olfativas.some((f) => familiaList.includes(normalizeText(f)))
      );
    }
  }

  // Filter by ocasiones (OR logic)
  if (params.ocasiones) {
    const occasionList = params.ocasiones.split(",").map((o) => normalizeText(o.trim())).filter(Boolean);
    if (occasionList.length > 0) {
      filtered = filtered.filter((p) =>
        p.ocasiones.some((o) => occasionList.includes(normalizeText(o)))
      );
    }
  }

  // Filter by generos (OR logic)
  if (params.generos) {
    const generoList = params.generos.split(",").map((g) => normalizeText(g.trim())).filter(Boolean);
    if (generoList.length > 0) {
      filtered = filtered.filter((p) =>
        p.generos.some((g) => generoList.includes(normalizeText(g)))
      );
    }
  }

  // Filter by price range
  if (params.precioMin) {
    const min = parseFloat(params.precioMin);
    if (!isNaN(min)) filtered = filtered.filter((p) => p.precio >= min);
  }
  if (params.precioMax) {
    const max = parseFloat(params.precioMax);
    if (!isNaN(max)) filtered = filtered.filter((p) => p.precio <= max);
  }

  // Full-text search
  if (params.q) {
    const q = normalizeText(params.q);
    filtered = filtered.filter((p) => {
      const haystack = normalizeText([
        p.nombre,
        p.marca,
        p.descripcion,
        p.resumen,
        p.familia_olfativa,
        p.concentracion,
      ]
        .filter(Boolean)
        .join(" "));
      return haystack.includes(q);
    });
  }

  // Sort
  if (params.sort === "precio-asc") {
    filtered = [...filtered].sort((a, b) => a.precio - b.precio);
  } else if (params.sort === "precio-desc") {
    filtered = [...filtered].sort((a, b) => b.precio - a.precio);
  } else if (params.sort === "nombre-asc") {
    filtered = [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / params.perPage);
  const page = Math.min(params.page, Math.max(1, totalPages));
  const start = (page - 1) * params.perPage;

  const items: ApiProducto[] = filtered
    .slice(start, start + params.perPage)
    .map((p) => ({
      id: p.id,
      nombre: p.nombre,
      marca: p.marca,
      precio: p.precio,
      imagenes: p.imagenes,
      imagen: p.imagenes[0] || null,
      categorias: p.categorias,
      familias_olfativas: p.familias_olfativas,
      ocasiones: p.ocasiones,
      generos: p.generos,
      descripcion: p.descripcion,
      resumen: p.resumen,
      familia_olfativa: p.familia_olfativa,
      concentracion: p.concentracion,
      tamano: p.tamano,
    }));

  const response: ApiResponse = {
    items,
    total,
    page,
    perPage: params.perPage,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    ...(errors.length > 0 ? { errors } : {}),
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "X-RateLimit-Remaining": String(remaining),
    },
  });
}
