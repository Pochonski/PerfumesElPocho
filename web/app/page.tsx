import Hero from "@/components/sections/Hero";
import ShippingBanner from "@/components/sections/ShippingBanner";
import HowItWorks from "@/components/sections/HowItWorks";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import CategoryShowcase from "@/components/sections/CategoryShowcase";
import CatalogSection from "@/components/sections/CatalogSection";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";
import type { Metadata } from "next";

// ISR: revalidar cada hora
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Perfumes El Pocho | Fragancias Premium en Costa Rica",
  description:
    "Más de 2,900 fragancias originales, árabes y de diseñador. Envíos a todo Costa Rica en 24-48h. Comprá por WhatsApp.",
};

export default function Home() {
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
            priceRange: "₡6,000 - ₡230,000",
          }),
        }}
      />

      <Hero />
      <ShippingBanner />
      <FeaturedProducts />
      <HowItWorks />
      <CategoryShowcase />
      <CatalogSection
        eyebrow="Catálogo"
        title="Nuestra Colección"
        description="Más de 2,900 fragancias originales, árabes y de diseñador. Filtrá por categoría, marca, precio, familia olfativa y más."
      />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
