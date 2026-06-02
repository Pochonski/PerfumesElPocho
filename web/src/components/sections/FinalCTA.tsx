import { AnimatedSection } from "@/components/ui/AnimatedSection";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import Button from "@/components/ui/Button";

export default function FinalCTA() {
  return (
    <AnimatedSection id="contacto" className="px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="relative overflow-hidden rounded-[32px] border border-[#c8a84e]/10 bg-gradient-to-br from-[#1a1a1a] via-[#111] to-[#0a0a0a] p-12 text-center md:p-20">
          {/* Background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,168,78,0.08)_0%,transparent_70%)]" />

          <div className="relative">
            <EyebrowBadge>Contáctanos</EyebrowBadge>

            <h2 className="mt-6 text-3xl font-semibold tracking-tighter text-white md:text-5xl">
              ¿Listo para encontrar
              <br />
              <span className="gold-gradient">tu esencia</span>?
            </h2>

            <p className="mx-auto mt-4 max-w-[48ch] text-zinc-400">
              Escríbenos por WhatsApp y te ayudamos a elegir la fragancia
              perfecta. Envíos a todo Costa Rica.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                href="https://wa.me/50664779672"
                showArrow
              >
                WhatsApp
              </Button>
              <Button href="mailto:joseph19102005@gmail.com" variant="secondary">
                Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
