// Homepage: hero + product grid.
//
// Server Component that fetches products from Strapi. If Strapi is unreachable
// the strapiFetch layer returns an error string, which we surface as a friendly
// "service unavailable" message instead of a stack trace.

import { getProducts } from "@/lib/strapi/products";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { Suspense } from "react";

async function ProductSection() {
  const result = await getProducts({ pageSize: 12, isActive: true });

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

  if (!result.data || result.data.products.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        No products available yet. Check back soon!
      </div>
    );
  }

  return <ProductGrid products={result.data.products} />;
}

export default function HomePage() {
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
          <ProductSection />
        </Suspense>
      </section>
    </div>
  );
}
