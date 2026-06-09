import type { Metadata } from "next";
import CatalogSection from "@/components/sections/CatalogSection";

export const revalidate = 3600;

interface SearchPageProps {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q || "").trim();
  if (!query) {
    return {
      title: "Buscar fragancias | Perfumes El Pocho",
      description:
        "Buscá entre más de 2,900 fragancias originales, árabes y de diseñador. Envíos a todo Costa Rica.",
    };
  }
  return {
    title: `Resultados para “${query}” | Perfumes El Pocho`,
    description: `Encontrá fragancias que coincidan con “${query}” en nuestro catálogo de perfumes originales.`,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, categoria } = await searchParams;
  const query = (q || "").trim();
  const initialCategory = categoria?.trim() || "Todos";

  const title = query
    ? `Resultados para “${query}”`
    : "Buscá tu fragancia";
  const description = query
    ? `Fragancias que coinciden con tu búsqueda.`
    : "Tipeá el nombre de un perfume o marca para empezar.";

  return (
    <main className="pt-28 md:pt-32">
      <CatalogSection
        eyebrow="Búsqueda"
        title={title}
        description={description}
        initialCategory={initialCategory}
        hideSearch
        id="search-results"
      />
    </main>
  );
}
