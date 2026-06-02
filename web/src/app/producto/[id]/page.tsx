import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductos, getProductoById } from "@/lib/productos";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Footer from "@/components/sections/Footer";

export function generateStaticParams() {
  const productos = getProductos();
  return productos.map((p) => ({ id: String(p.id) }));
}

export default function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = params as unknown as { id: string };
  const producto = getProductoById(Number(id));

  if (!producto) notFound();

  const formatPrice = (price: number) =>
    `₡${price.toLocaleString("es-CR")}`;

  return (
    <>
      <main className="min-h-screen pt-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-300 transition-colors">
              Inicio
            </Link>
            <span>/</span>
            {producto.categorias.map((cat) => (
              <span key={cat}>
                <Link
                  href={`/#productos`}
                  className="hover:text-zinc-300 transition-colors"
                >
                  {cat}
                </Link>
                <span className="mx-1">/</span>
              </span>
            ))}
            <span className="text-zinc-400 line-clamp-1">{producto.nombre}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Images */}
            <div className="flex flex-col gap-4">
              <div className="card-surface overflow-hidden">
                {producto.imagenes[0] ? (
                  <img
                    src={producto.imagenes[0].local}
                    alt={producto.nombre}
                    className="h-auto w-full object-contain p-8"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center text-zinc-700">
                    Sin imagen
                  </div>
                )}
              </div>

              {producto.imagenes.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {producto.imagenes.slice(1).map((img, i) => (
                    <div key={i} className="card-surface aspect-square overflow-hidden p-2">
                      <img
                        src={img.local}
                        alt={`${producto.nombre} ${i + 2}`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <Link
                href="/"
                className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300"
              >
                <ArrowLeft size={14} />
                Volver al catálogo
              </Link>

              <h1 className="text-2xl font-semibold tracking-tighter text-white md:text-3xl">
                {producto.nombre}
              </h1>

              <p className="mt-4 text-3xl font-bold gold-gradient">
                {formatPrice(producto.precio)}
              </p>

              {producto.resumen && (
                <p className="mt-6 text-zinc-400 leading-relaxed">
                  {producto.resumen}
                </p>
              )}

              {/* Attributes */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {producto.marca && (
                  <div className="card-surface p-4">
                    <span className="text-xs text-zinc-500">Marca</span>
                    <p className="mt-1 text-sm font-medium text-zinc-200">
                      {producto.marca}
                    </p>
                  </div>
                )}
                {producto.concentracion && (
                  <div className="card-surface p-4">
                    <span className="text-xs text-zinc-500">Concentración</span>
                    <p className="mt-1 text-sm font-medium text-zinc-200">
                      {producto.concentracion}
                    </p>
                  </div>
                )}
                {producto.tamano && (
                  <div className="card-surface p-4">
                    <span className="text-xs text-zinc-500">Tamaño</span>
                    <p className="mt-1 text-sm font-medium text-zinc-200">
                      {producto.tamano}
                    </p>
                  </div>
                )}
                {producto.genero && (
                  <div className="card-surface p-4">
                    <span className="text-xs text-zinc-500">Género</span>
                    <p className="mt-1 text-sm font-medium text-zinc-200">
                      {producto.genero}
                    </p>
                  </div>
                )}
                {producto.familia_olfativa && (
                  <div className="card-surface p-4">
                    <span className="text-xs text-zinc-500">Familia Olfativa</span>
                    <p className="mt-1 text-sm font-medium text-zinc-200">
                      {producto.familia_olfativa}
                    </p>
                  </div>
                )}
                {producto.ocasion && (
                  <div className="card-surface p-4">
                    <span className="text-xs text-zinc-500">Ocasión</span>
                    <p className="mt-1 text-sm font-medium text-zinc-200">
                      {producto.ocasion}
                    </p>
                  </div>
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

              {/* Description */}
              {producto.descripcion && producto.descripcion !== producto.resumen && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-zinc-300">
                    Descripción
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                    {producto.descripcion}
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="mt-8">
                <Button
                  href={`https://wa.me/5068420791630?text=Hola!%20Me%20interesa%20${encodeURIComponent(producto.nombre)}%20-%20${formatPrice(producto.precio)}`}
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
