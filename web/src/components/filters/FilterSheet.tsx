"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";
import { lockBodyScroll } from "@/lib/scroll-lock";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  
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
    lockBodyScroll(open);
    if (open) setTranslateY(0);
    return () => lockBodyScroll(false);
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
      {}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-3xl border-t border-border-emphasis bg-background shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open && !dragging ? "translate-y-0" : ""
        }`}
        style={{
          transform: open
            ? `translateY(${translateY}px)`
            : "translateY(100%)",
          transition: dragging ? "none" : undefined,
        }}
      >
        {}
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
          <div className="h-1.5 w-12 rounded-full bg-border-emphasis" />
        </div>

        {}
        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-5 py-3">
          <h2 className="text-base font-semibold text-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border-emphasis text-muted-foreground transition-all hover:scale-105 hover:text-foreground"
            aria-label="Cerrar filtros"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {}
        <div
          className="flex-1 touch-pan-y overflow-y-auto px-5 py-3"
          data-lenis-prevent
        >
          {children}
        </div>

        {}
        {footer && (
          <div className="shrink-0 border-t border-border-subtle bg-background/80 p-4 backdrop-blur-md">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
