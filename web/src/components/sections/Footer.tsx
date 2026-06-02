import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] px-6 py-12 md:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <Link href="/" className="text-lg font-bold tracking-tighter gold-gradient">
            Perfumes El Pocho
          </Link>
          <p className="mt-1 text-sm text-zinc-500">
            Fragancias que dejan huella
          </p>
        </div>

        <div className="flex gap-8 text-sm text-zinc-500">
          <Link href="/#productos" className="hover:text-zinc-300 transition-colors">
            Productos
          </Link>
          <Link href="/#categorias" className="hover:text-zinc-300 transition-colors">
            Categorías
          </Link>
          <Link href="/#contacto" className="hover:text-zinc-300 transition-colors">
            Contacto
          </Link>
        </div>

        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} Perfumes El Pocho. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
