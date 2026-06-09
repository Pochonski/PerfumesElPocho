import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getProductos,
  getFacetCounts,
  normalizeText,
  type Producto,
} from "@/lib/productos";

export const dynamic = "force-static";
export const revalidate = 3600;

/* ─── Rate Limiting ─── */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;

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

/* ─── Zod Schema ─── */
const SearchParamsSchema = z.object({
  categoria: z.string().optional(),
  marcas: z.string().optional(),
  familias: z.string().optional(),
  ocasiones: z.string().optional(),
  generos: z.string().optional(),
  precioMin: z.string().optional(),
  precioMax: z.string().optional(),
  q: z.string().optional(),
  sort: z.string().optional(),
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

interface ApiProducto {
  id: number;
  nombre: string;
  marca: string;
  precio: number;
  imagenes: string[];
  categorias: string[];
  familias_olfativas: string[];
  ocasiones: string[];
  generos: string[];
  descripcion: string;
  resumen: string;
  familia_olfativa: string;
  concentracion: string;
  tamano: string;
}

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const rawObj = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = SearchParamsSchema.safeParse(rawObj);

  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos." }, { status: 400 });
  }

  const params = parsed.data;
  let filtered = getProductos();

  /* Listas activas (originales, no normalizadas) para el cálculo de facetCounts */
  const activeMarcas: string[] = [];
  const activeFamilias: string[] = [];
  const activeOcasiones: string[] = [];
  const activeGeneros: string[] = [];

  if (params.categoria && params.categoria !== "Todos") {
    filtered = filtered.filter((p) => p.categorias.includes(params.categoria!));
  }
  if (params.marcas) {
    const list = params.marcas.split(",").map((m) => m.trim()).filter(Boolean);
    const normList = list.map(normalizeText);
    if (normList.length > 0) {
      activeMarcas.push(...list);
      filtered = filtered.filter((p) => normList.includes(normalizeText(p.marca)));
    }
  }
  if (params.familias) {
    const list = params.familias.split(",").map((f) => f.trim()).filter(Boolean);
    const normList = list.map(normalizeText);
    if (normList.length > 0) {
      activeFamilias.push(...list);
      filtered = filtered.filter((p) =>
        p.familias_olfativas.some((f) => normList.includes(normalizeText(f)))
      );
    }
  }
  if (params.ocasiones) {
    const list = params.ocasiones.split(",").map((o) => o.trim()).filter(Boolean);
    const normList = list.map(normalizeText);
    if (normList.length > 0) {
      activeOcasiones.push(...list);
      filtered = filtered.filter((p) =>
        p.ocasiones.some((o) => normList.includes(normalizeText(o)))
      );
    }
  }
  if (params.generos) {
    const list = params.generos.split(",").map((g) => g.trim()).filter(Boolean);
    const normList = list.map(normalizeText);
    if (normList.length > 0) {
      activeGeneros.push(...list);
      filtered = filtered.filter((p) =>
        p.generos.some((g) => normList.includes(normalizeText(g)))
      );
    }
  }
  if (params.precioMin) {
    const min = parseFloat(params.precioMin);
    if (!isNaN(min)) filtered = filtered.filter((p) => p.precio >= min);
  }
  if (params.precioMax) {
    const max = parseFloat(params.precioMax);
    if (!isNaN(max)) filtered = filtered.filter((p) => p.precio <= max);
  }
  if (params.q) {
    const q = normalizeText(params.q);
    filtered = filtered.filter((p) => {
      const haystack = normalizeText([
        p.nombre, p.marca, p.descripcion, p.resumen,
        p.familia_olfativa, p.concentracion,
      ].filter(Boolean).join(" "));
      return haystack.includes(q);
    });
  }

  if (params.sort === "precio-asc") {
    filtered = [...filtered].sort((a, b) => a.precio - b.precio);
  } else if (params.sort === "precio-desc") {
    filtered = [...filtered].sort((a, b) => b.precio - a.precio);
  } else if (params.sort === "nombre-asc") {
    filtered = [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  /* Calcular facet counts sobre el universo filtrado (sin paginar) */
  const facetCounts = getFacetCounts(filtered, {
    marcas: activeMarcas,
    familias: activeFamilias,
    ocasiones: activeOcasiones,
    generos: activeGeneros,
  });

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

  return NextResponse.json({
    items,
    total,
    page,
    perPage: params.perPage,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    facetCounts,
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "X-RateLimit-Remaining": String(remaining),
    },
  });
}
