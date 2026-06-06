"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { WarningCircle } from "@phosphor-icons/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-8 flex justify-center">
          <div className="card-surface flex h-20 w-20 items-center justify-center rounded-full">
            <WarningCircle
              size={36}
              weight="duotone"
              className="text-[#c8a84e]"
            />
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c8a84e]">
          Error inesperado
        </p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tighter text-white md:text-5xl">
          Algo <span className="gold-gradient">salió mal</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-zinc-400">
          Tuvimos un problema al cargar esta página. Probá de nuevo, y si el
          problema persiste, escribinos por WhatsApp.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} showArrow>
            Intentar de nuevo
          </Button>
          <Button
            href="https://wa.me/50664779672"
            variant="secondary"
          >
            WhatsApp
          </Button>
        </div>
      </div>
    </main>
  );
}
