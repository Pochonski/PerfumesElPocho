import CatalogClient from "@/components/sections/CatalogClient";
import type { Producto } from "@/lib/productos";

interface CatalogSectionProps {
  productos: Producto[];
  initialCategory?: string;
  availableCategories?: string[];
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  /** Search params del request (server-side) */
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function CatalogSection({
  searchParams,
  ...props
}: CatalogSectionProps) {
  return <CatalogClient {...props} searchParams={searchParams} />;
}
