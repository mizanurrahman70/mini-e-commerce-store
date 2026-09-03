// Admin: all orders with status management. Admin-only (protected by proxy.ts).

import { Suspense } from "react";
import { getServerJwt } from "@/lib/server";
import { getOrders } from "@/lib/strapi/orders";
import { AdminOrdersTable } from "@/components/orders/AdminOrdersTable";
import { ListSkeleton } from "@/components/ui/Skeleton";

async function Orders() {
  const jwt = await getServerJwt();
  if (!jwt) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        Not authenticated.
      </div>
    );
  }

  const result = await getOrders(jwt, { pagination: { pageSize: 100 } });
  if (result.error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h3 className="font-semibold text-amber-800">Unable to load orders</h3>
        <p className="mt-1 text-sm text-amber-700">{result.error} Please try again shortly.</p>
      </div>
    );
  }

  return <AdminOrdersTable orders={result.data ?? []} />;
}

export default function AdminOrdersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review and update the status of all orders.
      </p>
      <div className="mt-8">
        <Suspense fallback={<ListSkeleton rows={5} />}>
          <Orders />
        </Suspense>
      </div>
    </div>
  );
}
