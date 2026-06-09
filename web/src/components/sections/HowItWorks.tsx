import { AnimatedSection } from "@/components/ui/AnimatedSection";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import {
  MagnifyingGlass,
  WhatsappLogo,
  Truck,
} from "@phosphor-icons/react/dist/ssr";

const steps = [
  {
    icon: MagnifyingGlass,
    step: "01",
    title: "Explorá el catálogo",
    description:
      "Buscá por nombre, filtrá por categoría o navegá entre más de 4,000 fragancias. Encontrá la tuya en segundos.",
  },
  {
    icon: WhatsappLogo,
    step: "02",
    title: "Pedí por WhatsApp",
    description:
      "En cada perfume tenés un botón directo a WhatsApp con el producto pre-cargado. Solo decinos cuál querés.",
  },
  {
    icon: Truck,
    step: "03",
    title: "Recibilo en tu casa",
    description:
      "Envíos a todo Costa Rica en 24-48 horas. Sin vueltas, sin trámites. El perfume llega a tu puerta.",
  },
];

export default function HowItWorks() {
  return (
    <AnimatedSection className="px-6 py-24 md:px-8 md:py-32 border-t border-white/5">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <EyebrowBadge>Así de fácil</EyebrowBadge>
          <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)] md:text-5xl">
            ¿Cómo funciona?
          </h2>
          <p className="max-w-[48ch] text-[color:var(--muted-foreground)]">
            Tres pasos. Cero complicaciones. Tu perfume favorito más cerca que nunca.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="card-surface relative overflow-hidden p-8 text-center group transition-all duration-500 hover:border-[#c8a84e]/20"
              >
                {/* Step number */}
                <span className="absolute -top-6 -right-6 font-serif text-[120px] font-bold text-[color:var(--foreground)]/[0.03] select-none leading-none">
                  {s.step}
                </span>

                {/* Icon */}
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c8a84e]/10 border border-[#c8a84e]/15 group-hover:bg-[#c8a84e]/15 transition-colors duration-500">
                  <Icon size={28} className="text-[#c8a84e]" weight="duotone" />
                </div>

                <h3 className="mb-3 text-lg font-semibold text-[color:var(--foreground)]">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--muted-foreground)]">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
