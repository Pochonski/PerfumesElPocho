import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import CategoryShowcase from "@/components/sections/CategoryShowcase";
import ProductGrid from "@/components/sections/ProductGrid";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";
import { getProductos } from "@/lib/productos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfumes El Pocho | Fragancias Premium en Costa Rica",
  description:
    "Más de 4,000 fragancias originales, árabes y de diseñador. Envíos a todo Costa Rica en 24-48h. Comprá por WhatsApp.",
};

export default function Home() {
  const productos = getProductos();

  return (
    <main>
      {/* Schema.org Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "OnlineStore",
            name: "Perfumes El Pocho",
            description:
              "Tienda de perfumes originales, árabes y de diseñador. Envíos a todo Costa Rica.",
            url: "https://perfumeselpocho.com",
            telephone: "+50664779672",
            email: "joseph19102005@gmail.com",
            address: {
              "@type": "PostalAddress",
              addressCountry: "CR",
            },
            priceRange: "₡6,500 - ₡190,000",
          }),
        }}
      />

      <Hero />
      <HowItWorks />
      <CategoryShowcase />
      <ProductGrid productos={productos} />
      <FinalCTA />
      <Footer />
    </main>
  );
}
