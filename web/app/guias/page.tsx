import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getAllGuias, type Guia } from "@/data/guias";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import EyebrowBadge from "@/components/ui/EyebrowBadge";

export default function GuiasPage() {
  const guias = getAllGuias();

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <EyebrowBadge>Guías & educación</EyebrowBadge>
          <h1 className="mt-6 text-4xl font-semibold tracking-tighter text-foreground md:text-5xl lg:text-6xl">
            Aprendé sobre <span className="gold-gradient italic font-normal">fragancias</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Consejos, guías y cultura del perfume. Todo lo que necesitás saber
            para elegir tu próxima fragancia con confianza.
          </p>
        </AnimatedSection>

        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guias.map((g) => (
            <GuiaCard key={g.slug} guia={g} />
          ))}
        </div>
      </div>
    </main>
  );
}

function GuiaCard({ guia }: { guia: Guia }) {
  return (
    <Link
      href={`/guias/${guia.slug}`}
      className="card-surface card-surface-hover group flex flex-col p-6"
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
        {guia.category}
      </span>
      <h2 className="mt-3 text-xl font-semibold leading-snug text-foreground/90 transition-colors group-hover:text-foreground">
        {guia.title}
      </h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {guia.description}
      </p>
      <div className="mt-6 flex items-center justify-between text-xs text-muted">
        <span>{guia.readMinutes} min de lectura</span>
        <span className="inline-flex items-center gap-1 text-accent transition-transform group-hover:translate-x-1">
          Leer <ArrowRight size={14} weight="bold" />
        </span>
      </div>
    </Link>
  );
}
