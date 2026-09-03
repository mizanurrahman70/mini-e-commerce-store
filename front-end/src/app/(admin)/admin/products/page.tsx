// Admin: all products. Admin-only (protected by proxy.ts). Reuses the shared
// ProductManager which gates Edit/Delete by the permission map (admin gets
// full CRUD).

import { Suspense } from "react";
import { getProducts } from "@/lib/strapi/products";
import { getCategories } from "@/lib/strapi/categories";
import { ProductManager } from "@/components/products/ProductManager";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";

async function Products() {
  const [productsResult, categoriesResult] = await Promise.all([
    getProducts({ pageSize: 100 }),
    getCategories(),
  ]);

  if (productsResult.error || categoriesResult.error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h3 className="font-semibold text-amber-800">Unable to load products</h3>
        <p className="mt-1 text-sm text-amber-700">
          {productsResult.error} {categoriesResult.error}. Please try again shortly.
        </p>
      </div>
    );
  }

  return (
    <ProductManager
      products={productsResult.data?.products ?? []}
      categories={categoriesResult.data ?? []}
    />
  );
}

export default function AdminProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Products</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage every product in your catalogue.
      </p>
      <Card className="mt-8" padding="lg">
        <CardContent>
          <Suspense fallback={<ListSkeleton rows={6} />}>
            <Products />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
