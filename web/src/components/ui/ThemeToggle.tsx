"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--border-emphasis)] bg-[var(--card-bg)] text-[var(--muted-foreground)] transition-all hover:scale-105 hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
    >
      {isDark ? (
        <Sun size={16} weight="duotone" />
      ) : (
        <Moon size={16} weight="duotone" />
      )}
    </button>
  );
}
