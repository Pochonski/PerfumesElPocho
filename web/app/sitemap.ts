import type { MetadataRoute } from "next";
import { getProductos } from "@/lib/productos";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://perfumeselpocho.com";

  
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  
  const productos = getProductos();
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
