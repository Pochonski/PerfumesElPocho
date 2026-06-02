import Link from "next/link";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import EyebrowBadge from "@/components/ui/EyebrowBadge";
import {
  GenderFemale,
  GenderMale,
  GenderIntersex,
  Crop,
  Baby,
  Gift,
} from "@phosphor-icons/react/dist/ssr";

const categories = [
  {
    label: "Mujer",
    icon: GenderFemale,
    href: "/#productos",
    color: "from-pink-500/10 to-rose-500/5",
  },
  {
    label: "Hombre",
    icon: GenderMale,
    href: "/#productos",
    color: "from-blue-500/10 to-cyan-500/5",
  },
  {
    label: "Unisex",
    icon: GenderIntersex,
    href: "/#productos",
    color: "from-purple-500/10 to-violet-500/5",
  },
  {
    label: "Árabes",
    icon: Crop,
    href: "/#productos",
    color: "from-amber-500/10 to-yellow-500/5",
  },
  {
    label: "Niños",
    icon: Baby,
    href: "/#productos",
    color: "from-emerald-500/10 to-green-500/5",
  },
  {
    label: "Estuches",
    icon: Gift,
    href: "/#productos",
    color: "from-red-500/10 to-orange-500/5",
  },
];

export default function CategoryShowcase() {
  return (
    <AnimatedSection className="px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <EyebrowBadge>Categorías</EyebrowBadge>
          <h2 className="text-3xl font-semibold tracking-tighter text-white md:text-5xl">
            Encontrá lo que buscás
          </h2>
          <p className="max-w-[48ch] text-zinc-400">
            Navegá por categoría y descubrí fragancias para cada persona, ocasión y estilo.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className="card-surface card-surface-hover group relative flex flex-col items-center gap-4 overflow-hidden p-6 text-center"
              >
                {/* Gradient bg */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Icon */}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors duration-500">
                  <Icon
                    size={28}
                    className="text-zinc-400 group-hover:text-[#c8a84e] transition-colors duration-500"
                    weight="thin"
                  />
                </div>

                <span className="relative text-sm font-medium text-zinc-400 group-hover:text-white transition-colors duration-500">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
}
