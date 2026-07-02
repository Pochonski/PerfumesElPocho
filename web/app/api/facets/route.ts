import { NextResponse } from "next/server";
import {
  getCategorias,
  getMarcas,
  getFamiliasOlfativas,
  getOcasiones,
  getGeneros,
  getPrecioRange,
} from "@/lib/productos";

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
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120, must-revalidate",
      },
    }
  );
}
