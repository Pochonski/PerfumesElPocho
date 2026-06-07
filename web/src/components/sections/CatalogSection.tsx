"use client";

import CatalogClient from "@/components/sections/CatalogClient";

interface CatalogSectionProps {
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
