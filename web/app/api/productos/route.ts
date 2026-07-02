import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getProductos, getFacetCounts, normalizeText } from "@/lib/productos";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const PRICE_PATTERN = /^\d{1,9}(\.\d{1,2})?$/;
const INT_PATTERN = /^\d{1,5}$/;

const SearchParamsSchema = z.object({
  categoria: z.string().max(120).optional(),
  marcas: z.string().max(2000).optional(),
  familias: z.string().max(2000).optional(),
  ocasiones: z.string().max(2000).optional(),
  generos: z.string().max(2000).optional(),
  precioMin: z.string().regex(PRICE_PATTERN).optional(),
  precioMax: z.string().regex(PRICE_PATTERN).optional(),
  q: z.string().max(200).optional(),
  sort: z.enum(["precio-asc", "precio-desc", "nombre-asc"]).optional(),
  page: z
    .string()
    .regex(INT_PATTERN)
    .transform((v) => {
      const n = parseInt(v, 10);
      return isNaN(n) || n < 1 ? 1 : n;
    })
    .optional()
    .default(1),
  perPage: z
    .string()
    .regex(/^\d{1,3}$/)
    .transform((v) => {
      const n = parseInt(v, 10);
      if (isNaN(n) || n < 1) return 24;
      return n > 48 ? 48 : n;
    })
    .optional()
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
  const { allowed, remaining } = checkRateLimit(ip, { windowMs: 60_000, max: 120 });

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
    if (Number.isFinite(min)) filtered = filtered.filter((p) => p.precio >= min);
  }
  if (params.precioMax) {
    const max = parseFloat(params.precioMax);
    if (Number.isFinite(max)) filtered = filtered.filter((p) => p.precio <= max);
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
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120, must-revalidate",
      "X-RateLimit-Remaining": String(remaining),
    },
  });
}
