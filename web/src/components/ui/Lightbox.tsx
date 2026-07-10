"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "@phosphor-icons/react";
import { lockBodyScroll } from "@/lib/scroll-lock";

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

export function Lightbox({ open, onClose, src, alt }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    lockBodyScroll(true);
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      lockBodyScroll(false);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={`Imagen ampliada: ${alt}`}
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:scale-110 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Cerrar imagen ampliada"
      >
        <X size={20} weight="bold" />
      </button>

      <div
        className="relative max-h-[85vh] max-w-[85vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={1200}
          className="h-auto max-h-[85vh] w-auto max-w-[85vw] object-contain"
          sizes="85vw"
          priority
        />
      </div>
    </div>
  );
}
