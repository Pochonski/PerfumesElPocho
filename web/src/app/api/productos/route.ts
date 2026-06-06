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
const RATE_LIMIT_MAX = 60;

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
  marca: z.string().optional(),
  q: z.string().optional(),
  page: z
    .string()
    .transform((v) => {
      const n = parseInt(v, 10);
      return isNaN(n) || n < 1 ? 1 : n;
    })
    .default(1),
  perPage: z
    .string()
    .transform((v) => {
      const n = parseInt(v, 10);
      if (isNaN(n) || n < 1) return 24;
      return n > 48 ? 48 : n;
    })
    .default(24),
});

interface ApiParams {
  categoria?: string;
  marca?: string;
  q?: string;
  page: number;
  perPage: number;
}

function parseSearchParams(raw: NextRequest["nextUrl"]["searchParams"]): {
  params: ApiParams;
  errors: string[];
} {
  const rawObj = Object.fromEntries(raw.entries());
  const result = SearchParamsSchema.safeParse(rawObj);

  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return {
      params: {
        categoria: raw.get("categoria") ?? undefined,
        marca: raw.get("marca") ?? undefined,
        q: raw.get("q") ?? undefined,
        page: 1,
        perPage: 24,
      },
      errors,
    };
  }

  return { params: result.data as ApiParams, errors: [] };
}

/* ─── Response Types ─── */
interface ApiProducto extends Producto {
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

  if (params.categoria && params.categoria !== "Todos") {
    filtered = filtered.filter((p) => p.categorias.includes(params.categoria!));
  }

  if (params.marca) {
    const normalizedMarca = normalizeText(params.marca);
    filtered = filtered.filter((p) => normalizeText(p.marca) === normalizedMarca);
  }

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

  const total = filtered.length;
  const totalPages = Math.ceil(total / params.perPage);
  const start = (params.page - 1) * params.perPage;
  const items: ApiProducto[] = filtered
    .slice(start, start + params.perPage)
    .map((p) => ({
      ...p,
      imagen: p.imagenes[0] || null,
    }));

  const response: ApiResponse = {
    items,
    total,
    page: params.page,
    perPage: params.perPage,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrev: params.page > 1,
    ...(errors.length > 0 ? { errors } : {}),
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "X-RateLimit-Remaining": String(remaining),
    },
  });
}