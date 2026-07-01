import { SkeletonGrid } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <div className="h-6 w-32 animate-pulse rounded-full bg-skeleton-bg" />
          <div className="h-10 w-64 animate-pulse rounded-lg bg-skeleton-bg" />
          <div className="h-4 w-80 animate-pulse rounded bg-skeleton-bg" />
        </div>

        <SkeletonGrid count={8} columns={3} />
      </div>
    </main>
  );
}
