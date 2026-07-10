import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  findMarcaBySlug,
  getProductosByMarca,
  getMarcas,
  slugify,
} from "@/lib/productos";
import { serializeJsonLd } from "@/lib/json-ld";
import CatalogSection from "@/components/sections/CatalogSection";
import Footer from "@/components/sections/Footer";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const marcas = getMarcas();
  return marcas.map((m) => ({ slug: slugify(m) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const marca = findMarcaBySlug(slug);
  if (!marca) return { title: "Marca no encontrada" };

  return {
    title: `${marca} | Perfumes El Pocho`,
    description: `Perfumes de la marca ${marca}. Originales, con envío a todo Costa Rica.`,
    openGraph: {
      title: `${marca} | Perfumes El Pocho`,
      description: `Perfumes ${marca} con envío a todo Costa Rica.`,
      type: "website",
    },
  };
}

export default async function MarcaPage({ params }: PageProps) {
  const { slug } = await params;
  const marca = findMarcaBySlug(slug);
  if (!marca) notFound();

  const totalMarca = getProductosByMarca(marca).length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Perfumes ${marca}`,
            description: `Catálogo de perfumes de la marca ${marca}.`,
            url: `https://perfumeselpocho.com/marca/${slug}`,
            isPartOf: {
              "@type": "WebSite",
              name: "Perfumes El Pocho",
              url: "https://perfumeselpocho.com",
            },
          }),
        }}
      />

      <main className="min-h-screen pb-16">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <nav
            className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="transition-colors hover:text-foreground"
            >
              Inicio
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/#productos"
              className="transition-colors hover:text-foreground"
            >
              Catálogo
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-muted">{marca}</span>
          </nav>
        </div>

        <CatalogSection
          initialCategory="Todos"
          eyebrow={marca}
          title={`${marca}`}
          description={`${totalMarca.toLocaleString("es-CR")} fragancias de la marca ${marca}.`}
          id="catalogo-marca"
        />
      </main>

      <Footer />
    </>
  );
}
