"use client";

import { type ReactNode, Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import { lockBodyScroll } from "@/lib/scroll-lock";
import Button from "./Button";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";

export default function Navbar({ children }: { children?: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    prevFocusRef.current?.focus();
    prevFocusRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) {
      lockBodyScroll(false);
      return;
    }

    lockBodyScroll(true);
    prevFocusRef.current = document.activeElement as HTMLElement;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab" || !menuRef.current?.contains(document.activeElement)) return;
      const focusable = menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    focusTimeoutRef.current = setTimeout(() => {
      menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    }, 50);

    return () => {
      document.removeEventListener("keydown", handleKey);
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, [open, close]);

  return (
    <div
      className={`transition-all duration-500 ${
        scrolled
          ? "glass-surface"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="relative h-12 w-40 md:h-16 md:w-52">
            <Image
              src="/brand/logo.webp"
              alt="Perfumes El Pocho"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        <div className="hidden flex-1 justify-center md:flex md:max-w-md">
          <Suspense fallback={<SearchBarFallback variant="navbar" />}>
            <SearchBar variant="navbar" className="w-full" />
          </Suspense>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/#productos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Productos
          </Link>
          <Link href="/#productos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Categorías
          </Link>
          <Link href="/#contacto" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Contacto
          </Link>
          <ThemeToggle />
          <Button href="#contacto" showArrow>
            Contáctanos
          </Button>
          {children}
        </div>

        <button
          ref={toggleRef}
          className="shrink-0 text-foreground md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </nav>

      <div className="border-t border-border-subtle px-4 pb-3 pt-1 md:hidden">
        <Suspense fallback={<SearchBarFallback variant="panel" />}>
          <SearchBar variant="panel" />
        </Suspense>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          aria-hidden="true"
          onClick={close}
        />
      )}

      <div
        ref={menuRef}
        className={`${
          open ? "block relative z-50" : "hidden"
        } glass-surface border-t border-border-subtle md:hidden`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {open && (
          <div className="flex flex-col gap-1 px-6 py-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
            <Link href="/#productos" className="text-sm text-muted-foreground transition-colors hover:text-foreground py-2" onClick={close}>
              Productos
            </Link>
            <Link href="/#productos" className="text-sm text-muted-foreground transition-colors hover:text-foreground py-2" onClick={close}>
              Categorías
            </Link>
            <Link href="/#contacto" className="text-sm text-muted-foreground transition-colors hover:text-foreground py-2" onClick={close}>
              Contacto
            </Link>
            <div className="mt-3">
              <Button href="#contacto" showArrow>
                Contáctanos
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchBarFallback({ variant }: { variant: "navbar" | "panel" }) {
  const cls =
    variant === "panel"
      ? "card-surface w-full bg-transparent border-none h-[50px] rounded-2xl"
      : "card-surface w-full bg-transparent border-none h-[42px] rounded-2xl";
  return <div className={cls} aria-hidden="true" />;
}
