"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { formatPrice } from "@/lib/format";

interface Suggestion {
  id: number;
  nombre: string;
  marca: string;
  precio: number;
  imagen: string | null;
}

interface SearchBarProps {
  variant?: "navbar" | "panel";
  autoFocus?: boolean;
  className?: string;
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-[#c8a84e]/25 px-0.5 text-[#e2c87a]">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchBar({
  variant = "navbar",
  autoFocus = false,
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listboxId = useId();
  const inputId = useId();

  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    if (pathname === "/search") return searchParams.get("q") || "";
    return "";
  });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (pathname === "/search") {
      const urlQ = searchParams.get("q") || "";
      setQuery((prev) => (prev === urlQ ? prev : urlQ));
    }
  }, [pathname, searchParams]);

  const fetchSuggestions = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}&limit=6`, {
        signal: ctrl.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        if (!ctrl.signal.aborted) {
          setSuggestions([]);
          setIsLoading(false);
        }
        return;
      }
      const data = (await res.json()) as { items: Suggestion[] };
      if (ctrl.signal.aborted) return;
      setSuggestions(data.items || []);
      setActiveIndex(-1);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setSuggestions([]);
      }
    } finally {
      if (!ctrl.signal.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(trimmed);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const goToSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      setIsOpen(false);
      inputRef.current?.blur();
      const href = `/search?q=${encodeURIComponent(trimmed)}`;
      if (pathname === "/search") {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    },
    [pathname, router]
  );

  const goToProduct = useCallback(
    (id: number) => {
      setIsOpen(false);
      inputRef.current?.blur();
      router.push(`/producto/${id}`, { scroll: false });
    },
    [router]
  );

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      goToProduct(suggestions[activeIndex].id);
      return;
    }
    goToSearch(query);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const clear = () => {
    setQuery("");
    setSuggestions([]);
    setActiveIndex(-1);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const showDropdown = isOpen && query.trim().length >= 2;
  const activeId = activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined;

  const inputBase =
    "card-surface w-full bg-transparent border-none text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-0";
  const inputSizing =
    variant === "panel" ? "pl-12 pr-10 py-3 rounded-2xl" : "pl-10 pr-9 py-2.5 rounded-2xl";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form
        role="search"
        action="/search"
        method="GET"
        onSubmit={onSubmit}
        className="relative"
      >
        <label htmlFor={inputId} className="sr-only">
          Buscar fragancias
        </label>
        <MagnifyingGlass
          size={variant === "panel" ? 20 : 16}
          weight="bold"
          className={`absolute top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none ${
            variant === "panel" ? "left-4" : "left-3.5"
          }`}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          name="q"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Buscar fragancias…"
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          className={`${inputBase} ${inputSizing}`}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Limpiar búsqueda"
            className={`absolute top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors ${
              variant === "panel" ? "right-3" : "right-2.5"
            }`}
          >
            <X size={variant === "panel" ? 18 : 16} weight="bold" />
          </button>
        )}
      </form>

      {showDropdown && (
        <div
          className="glass-surface absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-white/5 shadow-2xl shadow-black/50"
          role="presentation"
        >
          {isLoading && suggestions.length === 0 ? (
            <ul className="p-2" aria-label="Cargando sugerencias">
              {Array.from({ length: 3 }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-xl p-3"
                  aria-hidden="true"
                >
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-zinc-800/70" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-800/70" />
                    <div className="h-2 w-1/2 animate-pulse rounded bg-zinc-800/50" />
                  </div>
                </li>
              ))}
            </ul>
          ) : suggestions.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">
              No encontramos fragancias para{" "}
              <span className="font-medium text-zinc-300">“{query.trim()}”</span>
              <p className="mt-2 text-xs text-zinc-600">
                Probá con el nombre o la marca
              </p>
            </div>
          ) : (
            <ul id={listboxId} role="listbox" aria-label="Sugerencias de búsqueda">
              {suggestions.map((s, i) => (
                <li
                  key={s.id}
                  id={`${listboxId}-opt-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      goToProduct(s.id);
                    }}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-2.5 text-left transition-colors ${
                      i === activeIndex
                        ? "bg-[#c8a84e]/10"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[var(--image-bg)]">
                      {s.imagen ? (
                        <Image
                          src={s.imagen}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-700 text-xs">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {highlightMatch(s.nombre, query.trim())}
                      </p>
                      {s.marca && (
                        <p className="truncate text-xs text-zinc-500">
                          {highlightMatch(s.marca, query.trim())}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-[#c8a84e]">
                      {formatPrice(s.precio)}
                    </span>
                  </button>
                </li>
              ))}
              {hasSearched && !isLoading && suggestions.length > 0 && (
                <li className="border-t border-white/5">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      goToSearch(query);
                    }}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-b-2xl p-3 text-xs font-medium text-[#c8a84e] transition-colors hover:bg-[#c8a84e]/10"
                  >
                    <MagnifyingGlass size={14} weight="bold" />
                    Ver todos los resultados para “{query.trim()}”
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
