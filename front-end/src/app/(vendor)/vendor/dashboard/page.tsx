// Vendor Dashboard: the vendor's own product management.
//
// Server Component. Reads the httpOnly JWT to identify the current vendor and
// fetches only products belonging to them. The interactive table (create/edit/
// delete) is a client component that gates actions via the permission map and
// performs mutations through server actions.
//
// NOTE: filtering to the vendor's own products here is a UI convenience. The
// backend's role permissions must enforce that a vendor can only ever read /
// update their own products — never trust this filter for security.

import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerJwt } from "@/lib/server";
import { decodeJwt } from "@/lib/jwt";
import { getProducts } from "@/lib/strapi/products";
import { getCategories } from "@/lib/strapi/categories";
import { ProductManager } from "@/components/products/ProductManager";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Package } from "lucide-react";

async function DashboardContent() {
  const jwt = await getServerJwt();
  if (!jwt) redirect("/login?redirect=/vendor/dashboard");

  const me = decodeJwt(jwt);
  const [productsResult, categoriesResult] = await Promise.all([
    getProducts({ vendorId: me?.id, pageSize: 100 }),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <CardTitle>Your products</CardTitle>
            <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-gray-900">
              <Package className="h-6 w-6 text-indigo-600" />
              {productsResult.data?.products.length ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <CardTitle>Manage your products</CardTitle>
          <div className="mt-4">
            {productsResult.error || categoriesResult.error ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
                <h3 className="font-semibold text-amber-800">Something went wrong</h3>
                <p className="mt-1 text-sm text-amber-700">
                  {productsResult.error ?? categoriesResult.error}. Please try again shortly.
                </p>
              </div>
            ) : (
              <ProductManager
                products={productsResult.data?.products ?? []}
                categories={categoriesResult.data ?? []}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VendorDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, edit and manage the products you sell.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          View storefront
        </Link>
      </div>

      <Suspense fallback={<ListSkeleton rows={5} />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
