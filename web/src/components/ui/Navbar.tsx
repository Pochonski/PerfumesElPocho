"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import Button from "./Button";

export default function Navbar({ children }: { children?: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-surface"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tighter gold-gradient">
            Perfumes El Pocho
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/#productos" className="text-sm text-zinc-400 transition-colors hover:text-zinc-200">
            Productos
          </Link>
          <Link href="/#categorias" className="text-sm text-zinc-400 transition-colors hover:text-zinc-200">
            Categorías
          </Link>
          <Link href="/#contacto" className="text-sm text-zinc-400 transition-colors hover:text-zinc-200">
            Contacto
          </Link>
          <Button href="#contacto" showArrow>
            Contáctanos
          </Button>
          {children}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-zinc-300"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="glass-surface border-t border-white/5 md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            <Link href="/#productos" className="text-sm text-zinc-400 transition-colors hover:text-zinc-200 py-2" onClick={() => setOpen(false)}>
              Productos
            </Link>
            <Link href="/#categorias" className="text-sm text-zinc-400 transition-colors hover:text-zinc-200 py-2" onClick={() => setOpen(false)}>
              Categorías
            </Link>
            <Link href="/#contacto" className="text-sm text-zinc-400 transition-colors hover:text-zinc-200 py-2" onClick={() => setOpen(false)}>
              Contacto
            </Link>
            <div className="mt-3">
              <Button href="#contacto" showArrow>
                Contáctanos
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
