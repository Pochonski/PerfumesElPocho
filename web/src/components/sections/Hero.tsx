"use client";

import Image from "next/image";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <>
      <section className="relative min-h-[80vh] overflow-hidden">
        {/* Main Content */}
        <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-[1400px] items-center px-6 py-24 md:px-8">
          <div className="mx-auto grid w-full grid-cols-1 items-center gap-12 md:grid-cols-2">
            {/* Left: Text */}
            <div className="text-center md:text-left">
              <EyebrowBadge>Fragancias Premium</EyebrowBadge>

              <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tighter text-white md:text-5xl lg:text-6xl xl:text-7xl">
                Descubre{" "}
                <span className="gold-gradient">fragancias</span>
                <br />
                que dejan huella
              </h1>

              <p className="mx-auto mt-6 max-w-[42ch] text-base leading-relaxed text-zinc-400 md:mx-0 md:text-lg">
                Más de 4,000 perfumes originales, árabes y de diseñador.
                Envíos a todo Costa Rica en 24-48 horas.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                <Button href="#productos" showArrow>
                  Ver Catálogo
                </Button>
                <Button
                  href="https://wa.me/50664779672"
                  variant="secondary"
                >
                  Contáctanos
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-600 md:justify-start">
                <span>🚚 Envíos 24-48h</span>
                <span>✅ 100% Original</span>
                <span>🇨🇷 Todo Costa Rica</span>
              </div>
            </div>

            {/* Right: Logo */}
            <div className="relative flex items-center justify-center">
              <div className="relative h-[280px] w-[280px] sm:h-[350px] sm:w-[350px] md:h-[400px] md:w-[400px] lg:h-[450px] lg:w-[450px]">
                <Image
                  src="/brand/logo.png"
                  alt="Perfumes El Pocho"
                  fill
                  sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, (max-width: 1024px) 400px, 450px"
                  className="object-contain drop-shadow-[0_20px_40px_rgba(200,168,78,0.15)]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
