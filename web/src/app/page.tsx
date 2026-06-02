import Hero from "@/components/sections/Hero";
import ProductGrid from "@/components/sections/ProductGrid";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";
import { getProductos } from "@/lib/productos";

export default function Home() {
  const productos = getProductos();

  return (
    <main>
      <Hero />
      <ProductGrid productos={productos} />
      <FinalCTA />
      <Footer />
    </main>
  );
}
