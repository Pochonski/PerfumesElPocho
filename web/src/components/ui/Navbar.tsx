"use client";

import { type ReactNode, Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import Button from "./Button";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";

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
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="relative h-10 w-32 md:h-12 md:w-40">
            <Image
              src="/brand/logo.png"
              alt="Perfumes El Pocho"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop search */}
        <div className="hidden flex-1 justify-center md:flex md:max-w-md">
          <Suspense fallback={<SearchBarFallback variant="navbar" />}>
            <SearchBar variant="navbar" className="w-full" />
          </Suspense>
        </div>

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
          <ThemeToggle />
          <Button href="#contacto" showArrow>
            Contáctanos
          </Button>
          {children}
        </div>

        {/* Mobile toggle */}
        <button
          className="shrink-0 text-zinc-300 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </nav>

      {/* Mobile search bar (always visible) */}
      <div className="border-t border-white/5 px-4 pb-3 pt-1 md:hidden">
        <Suspense fallback={<SearchBarFallback variant="panel" />}>
          <SearchBar variant="panel" />
        </Suspense>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="glass-surface border-t border-white/5 md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-zinc-500">Tema</span>
              <ThemeToggle />
            </div>
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

function SearchBarFallback({ variant }: { variant: "navbar" | "panel" }) {
  const cls =
    variant === "panel"
      ? "card-surface w-full bg-transparent border-none h-[50px] rounded-2xl"
      : "card-surface w-full bg-transparent border-none h-[42px] rounded-2xl";
  return <div className={cls} aria-hidden="true" />;
}
