import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  findCategoriaBySlug,
  getProductosByCategoria,
  getCategorias,
  slugify,
} from "@/lib/productos";
import { serializeJsonLd } from "@/lib/json-ld";
import CatalogSection from "@/components/sections/CatalogSection";
import Footer from "@/components/sections/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categorias = getCategorias();
  return categorias.map((c) => ({ slug: slugify(c) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoria = findCategoriaBySlug(slug);
  if (!categoria) return { title: "Categoría no encontrada" };

  return {
    title: `${categoria} | Perfumes El Pocho`,
    description: `Descubrí nuestra selección de perfumes ${categoria.toLowerCase()}. Originales, árabes y de diseñador con envío a todo Costa Rica.`,
    openGraph: {
      title: `${categoria} | Perfumes El Pocho`,
      description: `Perfumes ${categoria.toLowerCase()} con envío a todo Costa Rica.`,
      type: "website",
    },
  };
}

export default async function CategoriaPage({ params }: PageProps) {
  const { slug } = await params;
  const categoria = findCategoriaBySlug(slug);
  if (!categoria) notFound();

  const totalCategoria = getProductosByCategoria(categoria).length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Perfumes ${categoria}`,
            description: `Catálogo de perfumes ${categoria.toLowerCase()}.`,
            url: `https://perfumeselpocho.com/categoria/${slug}`,
            isPartOf: {
              "@type": "WebSite",
              name: "Perfumes El Pocho",
              url: "https://perfumeselpocho.com",
            },
          }),
        }}
      />

      <main className="min-h-screen pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          {}
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
            <span className="text-muted">{categoria}</span>
          </nav>
        </div>

        <CatalogSection
          initialCategory={categoria}
          eyebrow={categoria}
          title={`Perfumes ${categoria}`}
          description={`${totalCategoria.toLocaleString("es-CR")} fragancias de la categoría ${categoria.toLowerCase()}.`}
          id="catalogo-categoria"
        />
      </main>

      <Footer />
    </>
  );
}
