import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getProductos, getProductoById } from "@/lib/productos";
import Button from "@/components/ui/Button";
import Footer from "@/components/sections/Footer";
import ProductGallery from "@/components/product/ProductGallery";

/* ─── Static Params ─── */
export function generateStaticParams() {
  const productos = getProductos();
  // Solo generar los primeros 500 para no reventar el build
  // El resto se sirve SSR/ISR automáticamente
  return productos.slice(0, 500).map((p) => ({ id: String(p.id) }));
}

/* ─── Metadata Dinámica ─── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = (await params) as unknown as { id: string };
  const producto = getProductoById(Number(id));
  if (!producto) return { title: "Producto no encontrado" };

  const precio = `₡${producto.precio.toLocaleString("es-CR")}`;
  const imgUrl = producto.imagenes[0] || null;

  return {
    title: `${producto.nombre} — ${precio} | Perfumes El Pocho`,
    description:
      producto.resumen ||
      producto.descripcion?.slice(0, 160) ||
      `${producto.marca} — ${producto.concentracion} — ${producto.tamano}`,
    openGraph: {
      title: `${producto.nombre} — ${precio}`,
      description:
        producto.resumen || `${producto.marca} — ${producto.tamano}`,
      ...(imgUrl
        ? { images: [{ url: imgUrl, width: 800, height: 800 }] }
        : {}),
      type: "website",
    },
  };
}

/* ─── Página ─── */
export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = (await params) as unknown as { id: string };
  const producto = getProductoById(Number(id));

  if (!producto) notFound();

  const formatPrice = (price: number) =>
    `₡${price.toLocaleString("es-CR")}`;

  return (
    <>
      {/* Schema.org Product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: producto.nombre,
            description: producto.descripcion || producto.resumen || "",
            image: producto.imagenes[0] || undefined,
            brand: producto.marca
              ? { "@type": "Brand", name: producto.marca }
              : undefined,
            offers: {
              "@type": "Offer",
              price: producto.precio.toString(),
              priceCurrency: "CRC",
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
      <main className="min-h-screen pt-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
            <Link href="/" className="hover:text-[color:var(--foreground)] transition-colors">
              Inicio
            </Link>
            <span>/</span>
            {producto.categorias.slice(0, 2).map((cat) => (
              <span key={cat}>
                <Link
                  href={`/#productos`}
                  className="hover:text-[color:var(--foreground)] transition-colors"
                >
                  {cat}
                </Link>
                <span className="mx-1">/</span>
              </span>
            ))}
            <span className="line-clamp-1 text-[color:var(--subtle-foreground)]">
              {producto.nombre}
            </span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* ─── Images ─── */}
            <Suspense
              fallback={
                <div className="card-surface aspect-square animate-pulse bg-[var(--image-bg)]" />
              }
            >
              <ProductGallery
                imagenes={producto.imagenes}
                nombre={producto.nombre}
              />
            </Suspense>

            {/* ─── Product Info ─── */}
            <div>
              <h1 className="text-2xl font-semibold tracking-tighter text-[color:var(--foreground)] md:text-3xl">
                {producto.nombre}
              </h1>

              <p className="mt-4 text-3xl font-bold gold-gradient">
                {formatPrice(producto.precio)}
              </p>

              <p className="mt-2 text-xs text-[color:var(--muted)]">
                Envíos a todo Costa Rica 🇨🇷
              </p>

              {producto.resumen && (
                <p className="mt-6 leading-relaxed text-[color:var(--muted-foreground)]">
                  {producto.resumen}
                </p>
              )}

              {/* Attributes grid */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <AttributeCard label="Marca" value={producto.marca || "Sin marca"} />
                {producto.concentracion && (
                  <AttributeCard
                    label="Concentración"
                    value={producto.concentracion}
                  />
                )}
                {producto.tamano && (
                  <AttributeCard label="Tamaño" value={producto.tamano} />
                )}
                {producto.genero && (
                  <AttributeCard label="Género" value={producto.genero} />
                )}
                {producto.familia_olfativa && (
                  <AttributeCard
                    label="Familia Olfativa"
                    value={producto.familia_olfativa}
                  />
                )}
                {producto.ocasion && (
                  <AttributeCard label="Ocasión" value={producto.ocasion} />
                )}
              </div>

              {/* Categories */}
              <div className="mt-6 flex flex-wrap gap-2">
                {producto.categorias.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border border-[#c8a84e]/20 bg-[#c8a84e]/8 px-3 py-1 text-xs text-[#c8a84e]"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Full description */}
              {producto.descripcion &&
                producto.descripcion !== producto.resumen && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-[color:var(--subtle-foreground)]">
                      Descripción
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                      {producto.descripcion}
                    </p>
                  </div>
                )}

              {/* CTA */}
              <div className="mt-8">
                <Button
                  href={`https://wa.me/50664779672?text=Hola!%20Me%20interesa%20${encodeURIComponent(producto.nombre)}%20-%20${formatPrice(producto.precio)}`}
                  showArrow
                >
                  Consultar por WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ─── Mini Component ─── */
function AttributeCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="card-surface p-4">
      <span className="text-xs text-[color:var(--muted-foreground)]">{label}</span>
      <p className="mt-1 text-sm font-medium text-[color:var(--subtle-foreground)]">{value}</p>
    </div>
  );
}
