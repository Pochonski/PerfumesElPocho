import Hero from "@/components/sections/Hero";
import ShippingBanner from "@/components/sections/ShippingBanner";
import HowItWorks from "@/components/sections/HowItWorks";
import CatalogSection from "@/components/sections/CatalogSection";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { serializeJsonLd } from "@/lib/json-ld";
import { PRODUCT_COUNT_DISPLAY, PRICE_RANGE_DISPLAY } from "@/data/constants";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Perfumes El Pocho | Fragancias Premium en Costa Rica",
  description: `Más de ${PRODUCT_COUNT_DISPLAY} fragancias originales, árabes y de diseñador. Envíos a todo Costa Rica en 24-48h. Comprá por WhatsApp.`,
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "OnlineStore",
            name: SITE.brand,
            description:
              "Tienda de perfumes originales, árabes y de diseñador. Envíos a todo Costa Rica.",
            url: "https://perfumeselpocho.com",
            telephone: `+${SITE.whatsappNumber}`,
            email: SITE.contactEmail,
            address: {
              "@type": "PostalAddress",
              addressCountry: "CR",
            },
            priceRange: PRICE_RANGE_DISPLAY,
          }),
        }}
      />

      <Hero />
      <ShippingBanner />
      <HowItWorks />
      <CatalogSection
        id="productos"
        eyebrow="Catálogo"
        title="Nuestra Colección"
        description={`Más de ${PRODUCT_COUNT_DISPLAY} fragancias originales, árabes y de diseñador. Filtrá por categoría, marca, precio, familia olfativa y más.`}
      />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
