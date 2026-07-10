import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getProductos, getProductoById } from "@/lib/productos";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";
import { serializeJsonLd } from "@/lib/json-ld";
import Button from "@/components/ui/Button";
import Footer from "@/components/sections/Footer";
import ProductGallery from "@/components/product/ProductGallery";

export const revalidate = 3600;

export function generateStaticParams() {
  const productos = getProductos();
  return productos.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) return { title: "Producto no encontrado" };
  const producto = getProductoById(numId);
  if (!producto) return { title: "Producto no encontrado" };

  const precio = formatPrice(producto.precio);
  const imgUrl = producto.imagenes[0] || null;

  return {
    title: `${producto.nombre} — ${precio} | ${SITE.brand}`,
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

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) notFound();
  const producto = getProductoById(numId);

  if (!producto) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
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
      <main className="min-h-screen">
        <div className="mx-auto max-w-[1400px] px-6 md:px-8">
          <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Inicio
            </Link>
            <span>/</span>
            {producto.categorias.slice(0, 2).map((cat) => (
              <span key={cat}>
                <Link
                  href={`/#productos`}
                  className="hover:text-foreground transition-colors"
                >
                  {cat}
                </Link>
                <span className="mx-1">/</span>
              </span>
            ))}
            <span className="line-clamp-1 text-subtle-foreground">
              {producto.nombre}
            </span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2">
            <Suspense
              fallback={
                <div className="card-surface aspect-square animate-pulse bg-image-bg" />
              }
            >
              <ProductGallery
                imagenes={producto.imagenes}
                nombre={producto.nombre}
              />
            </Suspense>

            <div>
              <h1 className="text-2xl font-semibold tracking-tighter text-foreground md:text-3xl">
                {producto.nombre}
              </h1>

              <p className="mt-4 text-3xl font-bold gold-gradient">
                {formatPrice(producto.precio)}
              </p>

              <p className="mt-2 text-xs text-muted">
                Envíos a todo Costa Rica 🇨🇷
              </p>

              {producto.resumen && (
                <p className="mt-6 leading-relaxed text-muted-foreground">
                  {producto.resumen}
                </p>
              )}

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

              <div className="mt-6 flex flex-wrap gap-2">
                {producto.categorias.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border border-accent/20 bg-accent/8 px-3 py-1 text-xs text-accent"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {producto.descripcion &&
                producto.descripcion !== producto.resumen && (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-subtle-foreground">
                      Descripción
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {producto.descripcion}
                    </p>
                  </div>
                )}

              <div className="mt-8">
                <Button
                  href={SITE.whatsappHref(
                    `Hola! Me interesa ${producto.nombre} - ${formatPrice(producto.precio)}`
                  )}
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

function AttributeCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="card-surface p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="mt-1 text-sm font-medium text-subtle-foreground">{value}</p>
    </div>
  );
}
