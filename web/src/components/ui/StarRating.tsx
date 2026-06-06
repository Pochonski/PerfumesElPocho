import { Star } from "@phosphor-icons/react";

interface StarRatingProps {
  value: number;
  outOf?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  value,
  outOf = 5,
  size = 14,
  showValue = false,
  className = "",
}: StarRatingProps) {
  const stars = Array.from({ length: outOf }, (_, i) => {
    const fill = Math.max(0, Math.min(1, value - i));
    return fill;
  });

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${value} de ${outOf} estrellas`}
    >
      {stars.map((fill, i) => (
        <Star
          key={i}
          size={size}
          weight="fill"
          className={
            fill > 0
              ? "text-[color:var(--accent)]"
              : "text-[color:var(--border-emphasis)]"
          }
          style={{ opacity: fill > 0 ? Math.max(0.3, fill) : 1 }}
        />
      ))}
      {showValue && (
        <span className="ml-1.5 text-xs text-[color:var(--muted-foreground)]">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
