import type { MetadataRoute } from "next";
import { getProductos, getCategorias, getMarcas, slugify } from "@/lib/productos";
import { getAllGuias } from "@/data/guias";

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
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  const categorias = getCategorias();
  for (const c of categorias) {
    routes.push({
      url: `${baseUrl}/categoria/${slugify(c)}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    });
  }

  const marcas = getMarcas();
  for (const m of marcas) {
    routes.push({
      url: `${baseUrl}/marca/${slugify(m)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  routes.push({
    url: `${baseUrl}/guias`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  });

  const guias = getAllGuias();
  for (const g of guias) {
    routes.push({
      url: `${baseUrl}/guias/${g.slug}`,
      lastModified: new Date(g.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return routes;
}
