"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Contenido sticky en el footer (ej: "Aplicar filtros") */
  footer?: ReactNode;
}

export function FilterSheet({
  open,
  onClose,
  title = "Filtros",
  children,
  footer,
}: FilterSheetProps) {
  const [translateY, setTranslateY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTranslateY(0);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-3xl border-t border-[color:var(--border-emphasis)] bg-[color:var(--background)] shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open && !dragging ? "translate-y-0" : ""
        }`}
        style={{
          transform: open
            ? `translateY(${translateY}px)`
            : "translateY(100%)",
          transition: dragging ? "none" : undefined,
        }}
      >
        {/* Handle (único elemento con drag handlers) */}
        <div
          onPointerDown={(e) => {
            setDragging(true);
            startYRef.current = e.clientY;
          }}
          onPointerMove={(e) => {
            if (!dragging || startYRef.current == null) return;
            const dy = e.clientY - startYRef.current;
            if (dy > 0) setTranslateY(dy);
          }}
          onPointerUp={() => {
            if (!dragging) return;
            setDragging(false);
            if (translateY > 100) {
              onClose();
            } else {
              setTranslateY(0);
            }
            startYRef.current = null;
          }}
          onPointerCancel={() => {
            setDragging(false);
            setTranslateY(0);
            startYRef.current = null;
          }}
          className="flex shrink-0 cursor-grab touch-none items-center justify-center pt-2 pb-1 active:cursor-grabbing"
          aria-label="Arrastrar para cerrar"
        >
          <div className="h-1.5 w-12 rounded-full bg-[color:var(--border-emphasis)]" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--border-subtle)] px-5 py-3">
          <h2 className="text-base font-semibold text-[color:var(--foreground)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[color:var(--border-emphasis)] text-[color:var(--muted-foreground)] transition-all hover:scale-105 hover:text-[color:var(--foreground)]"
            aria-label="Cerrar filtros"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Content (con touch-pan-y + data-lenis-prevent) */}
        <div
          className="flex-1 touch-pan-y overflow-y-auto px-5 py-3"
          data-lenis-prevent
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t border-[color:var(--border-subtle)] bg-[color:var(--background)]/80 p-4 backdrop-blur-md">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
