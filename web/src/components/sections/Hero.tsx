import Image from "next/image";
import { Truck, ShieldCheck, MapPin } from "@phosphor-icons/react/dist/ssr";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import Button from "@/components/ui/Button";
import { SITE } from "@/lib/site";
import { PRODUCT_COUNT_TAG } from "@/data/constants";

const trustBadges = [
  { icon: Truck, label: "Envíos 24-48h" },
  { icon: ShieldCheck, label: "100% Original" },
  { icon: MapPin, label: "Todo Costa Rica" },
];

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] overflow-hidden">
      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-[1400px] items-center px-6 py-24 md:px-8">
        <div className="mx-auto grid w-full grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="text-center md:text-left">
            <EyebrowBadge>Fragancias Premium</EyebrowBadge>

            <h1 className="mt-6 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl xl:text-7xl">
              Descubre{" "}
              <span className="gold-gradient italic">fragancias</span>
              <br />
              que dejan huella
            </h1>

            <p className="mx-auto mt-6 max-w-[42ch] text-base leading-relaxed text-muted-foreground md:mx-0 md:text-lg">
              Más de {PRODUCT_COUNT_TAG} perfumes originales, árabes y de diseñador.
              Envíos a todo Costa Rica en 24-48 horas.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <Button href="/#productos" showArrow>
                Ver Catálogo
              </Button>
              <Button
                href={SITE.whatsappHref("")}
                variant="secondary"
              >
                Contáctanos
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-start">
              {trustBadges.map((b) => {
                const Icon = b.icon;
                return (
                  <li
                    key={b.label}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                  >
                    <Icon
                      size={16}
                      weight="duotone"
                      className="shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <span>{b.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative h-[280px] w-[280px] sm:h-[350px] sm:w-[350px] md:h-[400px] md:w-[400px] lg:h-[450px] lg:w-[450px]">
              <Image
                src="/brand/logo.webp"
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
  );
}
