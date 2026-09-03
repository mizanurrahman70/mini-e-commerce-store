// My Orders page: the logged-in customer's own orders.
//
// Server Component. Reads the httpOnly JWT from the cookie and calls Strapi's
// getMyOrders, which is scoped to the authenticated user by Strapi's own
// permission/config. If Strapi is unreachable or the user isn't logged in we
// show a friendly message.

import Link from "next/link";
import { getServerJwt } from "@/lib/server";
import { getMyOrders } from "@/lib/strapi/orders";
import { OrderCard } from "@/components/orders/OrderCard";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Suspense } from "react";

async function OrdersList() {
  const jwt = await getServerJwt();
  if (!jwt) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">You need to be logged in to view your orders.</p>
        <Link
          href="/login?redirect=/orders"
          className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Log in
        </Link>
      </div>
    );
  }

  const result = await getMyOrders(jwt);
  if (result.error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-amber-800">Unable to load orders</h2>
        <p className="mt-2 text-sm text-amber-700">
          Our service is temporarily unavailable. Please try again shortly.
        </p>
      </div>
    );
  }

  const orders = result.data ?? [];
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">You haven&apos;t placed any orders yet.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(({ id, order }) => (
        <OrderCard key={id} id={id} order={order} />
      ))}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">My orders</h1>
      <p className="mt-1 text-sm text-gray-500">
        Track the status of your recent purchases.
      </p>
      <div className="mt-8">
        <Suspense fallback={<ListSkeleton rows={4} />}>
          <OrdersList />
        </Suspense>
      </div>
    </div>
  );
}
