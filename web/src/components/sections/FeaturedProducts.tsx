import { getProductos } from "@/lib/productos";
import type { Producto } from "@/lib/productos";
import FeaturedProductsCarousel from "./FeaturedProductsCarousel";

const FEATURED_COUNT = 12;

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function FeaturedProducts() {
  const all = getProductos();
  const items = shuffle(
    all.filter((p: Producto) => p.imagenes && p.imagenes.length > 0)
  ).slice(0, FEATURED_COUNT);

  return <FeaturedProductsCarousel items={items} />;
}
