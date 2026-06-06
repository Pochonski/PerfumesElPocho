import { NextResponse, type NextRequest } from "next/server";
import {
  getProductos,
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
  const categoria = searchParams.get("categoria");
  const marca = searchParams.get("marca");
  const q = searchParams.get("q")?.toLowerCase().trim() || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, parseInt(searchParams.get("perPage") || `${DEFAULT_PER_PAGE}`, 10))
  );

  let filtered: Producto[] = getProductos();

  if (categoria && categoria !== "Todos") {
    filtered = filtered.filter((p) => p.categorias.includes(categoria));
  }
  if (marca) {
    filtered = filtered.filter((p) => p.marca === marca);
  }
  if (q) {
    filtered = filtered.filter((p) => {
      const haystack = [
        p.nombre,
        p.marca,
        p.descripcion,
        p.resumen,
        p.familia_olfativa,
        p.concentracion,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
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
