import { NextResponse, type NextRequest } from "next/server";
import {
  getProductos,
  normalizeText,
  type Producto,
} from "@/lib/productos";

export const dynamic = "force-static";
export const revalidate = 3600;

interface ApiProducto extends Producto {
  imagen: string | null;
}

const DEFAULT_PER_PAGE = 24;
const MAX_PER_PAGE = 48;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Validar y normalizar params
  const rawCategoria = searchParams.get("categoria");
  const rawMarca = searchParams.get("marca");
  const rawQ = searchParams.get("q") || "";
  const rawPage = searchParams.get("page") || "1";
  const rawPerPage = searchParams.get("perPage") || `${DEFAULT_PER_PAGE}`;

  const categoria = rawCategoria || "Todos";
  const q = normalizeText(rawQ);
  const page = Math.max(1, parseInt(rawPage, 10) || 1);
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, parseInt(rawPerPage, 10) || DEFAULT_PER_PAGE)
  );

  let filtered: Producto[] = getProductos();

  if (categoria && categoria !== "Todos") {
    filtered = filtered.filter((p) => p.categorias.includes(categoria));
  }

  if (rawMarca) {
    const normalizedMarca = normalizeText(rawMarca);
    filtered = filtered.filter((p) => normalizeText(p.marca) === normalizedMarca);
  }

  if (q) {
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
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const items: ApiProducto[] = filtered
    .slice(start, start + perPage)
    .map((p) => ({
      ...p,
      imagen: p.imagenes[0] || null,
    }));

  return NextResponse.json(
    {
      items,
      total,
      page,
      perPage,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}