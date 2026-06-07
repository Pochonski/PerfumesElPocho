"use client";

import { Suspense } from "react";
import CatalogClient from "@/components/sections/CatalogClient";

interface CatalogSectionProps {
  initialCategory?: string;
  availableCategories?: string[];
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
}

function CatalogClientSkeleton() {
  return (
    <div className="px-6 py-24 md:px-8 md:py-32 border-t border-white/5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <div className="h-6 w-32 animate-pulse rounded-full bg-zinc-800" />
          <div className="h-10 w-64 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-4 w-80 animate-pulse rounded bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="card-surface overflow-hidden animate-pulse">
              <div className="aspect-square bg-zinc-800/50" />
              <div className="p-5 space-y-3">
                <div className="h-4 rounded bg-zinc-800/50 w-3/4" />
                <div className="h-4 rounded bg-zinc-800/50 w-1/2" />
                <div className="h-5 rounded bg-zinc-800/50 w-1/4 mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CatalogSection(props: CatalogSectionProps) {
  return (
    <Suspense fallback={<CatalogClientSkeleton />}>
      <CatalogClient {...props} />
    </Suspense>
  );
}
