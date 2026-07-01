import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Truck, ShieldCheck, Clock } from "@phosphor-icons/react/dist/ssr";

const badges = [
  {
    icon: Truck,
    text: "Envíos a todo Costa Rica",
  },
  {
    icon: Clock,
    text: "Entrega en 24-48 horas",
  },
  {
    icon: ShieldCheck,
    text: "100% Originales Garantizado",
  },
];

export default function ShippingBanner() {
  return (
    <AnimatedSection className="border-y border-border-subtle bg-shipping-banner-bg">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 divide-y divide-border-subtle sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.text}
                className="flex items-center justify-center gap-3 px-6 py-5"
              >
                <Icon
                  size={22}
                  className="shrink-0 text-accent"
                  weight="fill"
                />
                <span className="text-sm font-medium text-subtle-foreground">
                  {b.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
