// Homepage: hero + product catalog.
//
// Server Component. Reads URL search params (?q=, ?sort=, ?page=) to drive
// search, sorting and pagination server-side (shareable/bookmarkable URLs). If
// Strapi is unreachable the strapiFetch layer returns an error string, which we
// surface as a friendly "service unavailable" message instead of a stack trace.

import { Suspense } from "react";
import { getProducts } from "@/lib/strapi/products";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductTools } from "@/components/products/ProductTools";
import { Pagination } from "@/components/products/Pagination";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import type { SearchParams } from "@/lib/catalog";
import { readParam, sortToStrapi } from "@/lib/catalog";

const PAGE_SIZE = 12;

async function ProductSection({ params }: { params: SearchParams }) {
  const q = readParam(params, "q");
  const sort = sortToStrapi(readParam(params, "sort"));
  const rawPage = Number(readParam(params, "page"));
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const result = await getProducts({
    page,
    pageSize: PAGE_SIZE,
    isActive: true,
    search: q,
    sort,
  });

  if (result.error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-amber-800">
          We&apos;re having trouble loading products
        </h2>
        <p className="mt-2 text-sm text-amber-700">
          Our store is temporarily unavailable. Please try again shortly.
        </p>
      </div>
    );
  }

  const products = result.data?.products ?? [];
  const meta = result.data?.meta?.pagination;
  const total = meta?.total ?? products.length;
  const pageCount = meta?.pageCount ?? 1;

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <ProductTools />
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          {q ? (
            <>
              No products match{" "}
              <span className="font-medium text-gray-700">&quot;{q}&quot;</span>.
            </>
          ) : (
            "No products available yet. Check back soon!"
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductTools />
      {q && (
        <p className="text-sm text-gray-500">
          Showing results for <span className="font-medium text-gray-700">&quot;{q}&quot;</span>
        </p>
      )}
      <ProductGrid products={products} />
      <Pagination params={params} page={page} pageCount={pageCount} total={total} />
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: PageProps<"/">) {
  const params = await searchParams;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-200">
              Modern e-commerce
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Shop the latest products
            </h1>
            <p className="mt-4 text-lg text-indigo-100">
              Browse our curated catalogue, add to cart, and check out in
              minutes — powered by Strapi.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured products</h2>
            <p className="mt-1 text-sm text-gray-500">
              Hand-picked items, updated in real time.
            </p>
          </div>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <ProductSection params={params} />
        </Suspense>
      </section>
    </div>
  );
}
