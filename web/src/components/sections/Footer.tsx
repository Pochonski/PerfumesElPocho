import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--card-border)] bg-[color:var(--card-bg)]/50 px-6 py-12 md:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <Link href="/" className="font-serif text-lg font-bold tracking-tight gold-gradient">
            Perfumes El Pocho
          </Link>
          <p className="mt-1 text-sm italic text-[color:var(--muted-foreground)]">
            Fragancias que dejan huella
          </p>
        </div>

        <div className="flex gap-8 text-sm text-[color:var(--muted-foreground)]">
          <Link href="/#productos" className="transition-colors hover:text-[color:var(--foreground)]">
            Productos
          </Link>
          <Link href="/#categorias" className="transition-colors hover:text-[color:var(--foreground)]">
            Categorías
          </Link>
          <Link href="/#contacto" className="transition-colors hover:text-[color:var(--foreground)]">
            Contacto
          </Link>
        </div>

        <p className="text-xs text-[color:var(--muted-foreground)]">
          &copy; {new Date().getFullYear()} Perfumes El Pocho. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
