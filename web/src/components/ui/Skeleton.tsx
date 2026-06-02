"use client";

export function SkeletonCard() {
  return (
    <div className="card-surface overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-zinc-800/50" />

      {/* Info */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <div className="h-4 rounded-md bg-zinc-800 w-3/4" />
        <div className="h-4 rounded-md bg-zinc-800 w-1/2" />

        {/* Brand */}
        <div className="h-3 rounded-md bg-zinc-800/50 w-1/3" />

        {/* Price */}
        <div className="h-5 rounded-md bg-zinc-800 w-1/4 mt-3" />
      </div>
    </div>
  );
}

export function SkeletonGrid({
  count = 8,
  columns = 4,
}: {
  count?: number;
  columns?: number;
}) {
  return (
    <div
      className="grid gap-5"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
