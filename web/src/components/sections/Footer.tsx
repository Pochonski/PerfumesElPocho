import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-card-border bg-card-bg/50 px-6 py-12 md:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <Link href="/" className="font-serif text-lg font-bold tracking-tight gold-gradient">
            Perfumes El Pocho
          </Link>
          <p className="mt-1 text-sm italic text-muted-foreground">
            Fragancias que dejan huella
          </p>
        </div>

        <div className="flex gap-8 text-sm text-muted-foreground">
          <Link href="/#productos" className="transition-colors hover:text-foreground">
            Productos
          </Link>
          <Link href="/#categorias" className="transition-colors hover:text-foreground">
            Categorías
          </Link>
          <Link href="/#contacto" className="transition-colors hover:text-foreground">
            Contacto
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Perfumes El Pocho. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
