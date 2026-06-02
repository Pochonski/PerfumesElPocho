import type { MetadataRoute } from "next";
import { getProductos } from "@/lib/productos";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://perfumeselpocho.com";

  // Homepage
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Product pages (top 1000 for sitemap size)
  const productos = getProductos().slice(0, 1000);
  for (const p of productos) {
    routes.push({
      url: `${baseUrl}/producto/${p.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    });
  }

  return routes;
}
