import Link from "next/link";
import Button from "@/components/ui/Button";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-8 flex justify-center">
          <div className="card-surface flex h-20 w-20 items-center justify-center rounded-full">
            <MagnifyingGlass size={36} weight="duotone" className="text-[#c8a84e]" />
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c8a84e]">
          Error 404
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tighter text-[color:var(--foreground)] md:text-5xl">
          Esta fragancia <span className="gold-gradient">no existe</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[color:var(--muted-foreground)]">
          El perfume que buscás no está en nuestro catálogo. Pero tenemos más de
          4,000 fragancias esperándote.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button href="/" showArrow>
            Volver al inicio
          </Button>
          <Button href="/#productos" variant="secondary">
            Ver catálogo
          </Button>
        </div>
      </div>
    </main>
  );
}
