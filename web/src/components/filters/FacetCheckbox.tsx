"use client";

interface FacetCheckboxProps {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export function FacetCheckbox({
  label,
  count,
  checked,
  onChange,
  disabled = false,
}: FacetCheckboxProps) {
  return (
    <label
      className={`group flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:bg-foreground/5"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          checked
            ? "border-accent bg-accent"
            : "border-border-emphasis bg-transparent group-hover:border-accent/60"
        }`}
        aria-hidden="true"
      >
        {checked && (
          <svg
            viewBox="0 0 12 12"
            className="h-2.5 w-2.5 text-price-pill-fg"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M2 6.5l2.5 2.5L10 3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
      <span className="flex-1 truncate text-foreground/85 group-hover:text-foreground">
        {label}
      </span>
      {count != null && (
        <span className="font-mono text-xs tabular-nums text-muted">
          {count}
        </span>
      )}
    </label>
  );
}
