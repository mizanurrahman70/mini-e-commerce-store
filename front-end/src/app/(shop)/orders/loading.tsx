// Loading fallback for the orders page.

import { ListSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
      <div className="mt-8">
        <ListSkeleton rows={4} />
      </div>
    </div>
  );
}
