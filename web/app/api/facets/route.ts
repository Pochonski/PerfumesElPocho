import { NextResponse } from "next/server";
import {
  getCategorias,
  getMarcas,
  getFamiliasOlfativas,
  getOcasiones,
  getGeneros,
  getPrecioRange,
} from "@/lib/productos";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  return NextResponse.json(
    {
      categorias: getCategorias(),
      marcas: getMarcas(),
      familias: getFamiliasOlfativas(),
      ocasiones: getOcasiones(),
      generos: getGeneros(),
      precioRange: getPrecioRange(),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
