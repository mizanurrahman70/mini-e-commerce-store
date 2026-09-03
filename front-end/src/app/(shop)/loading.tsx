// Route-level loading fallback for the shop homepage while the product grid
// streams in. Shows a skeleton matching the product grid layout.

import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="h-4 w-40 animate-pulse rounded bg-white/30" />
          <div className="mt-3 h-10 w-3/4 animate-pulse rounded bg-white/30" />
          <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-white/20" />
        </div>
      </div>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 h-8 w-56 animate-pulse rounded bg-gray-200" />
        <ProductGridSkeleton count={8} />
      </section>
    </div>
  );
}
