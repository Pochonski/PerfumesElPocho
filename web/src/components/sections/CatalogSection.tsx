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
}

export default function CatalogSection(props: CatalogSectionProps) {
  return <CatalogClient {...props} />;
}
