// Admin Dashboard: high-level overview of the store.
//
// Server Component, admin-only (protected by proxy.ts). Fetches aggregate stats
// from Strapi. If Strapi is unreachable we show a friendly notice.

import { Suspense } from "react";
import Link from "next/link";
import { getServerJwt } from "@/lib/server";
import { getOrders } from "@/lib/strapi/orders";
import { getProducts } from "@/lib/strapi/products";
import { getUsers } from "@/lib/strapi/users";
import { formatPrice } from "@/lib/format";
import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Package, ClipboardList, Users, DollarSign } from "lucide-react";

async function Stats() {
  const jwt = await getServerJwt();
  if (!jwt) return null;

  const [ordersResult, productsResult, usersResult] = await Promise.all([
    getOrders(jwt, { pagination: { pageSize: 100 } }),
    getProducts({ pageSize: 100 }),
    getUsers(jwt),
  ]);

  const orders = ordersResult.data ?? [];
  const revenue = orders.reduce((sum, o) => sum + (o.order.totalAmount ?? 0), 0);
  const productCount = productsResult.data?.products.length ?? 0;
  const orderCount = orders.length;
  const userCount = usersResult.data?.length ?? 0;

  const error = ordersResult.error || productsResult.error || usersResult.error;

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <h3 className="font-semibold text-amber-800">Unable to load dashboard</h3>
        <p className="mt-1 text-sm text-amber-700">
          Store data is temporarily unavailable. Please try again shortly.
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Total products", value: String(productCount), icon: Package, href: "/admin/products" },
    { label: "Total orders", value: String(orderCount), icon: ClipboardList, href: "/admin/orders" },
    { label: "Customers & users", value: String(userCount), icon: Users, href: "/admin/users" },
    { label: "Total revenue", value: formatPrice(revenue), icon: DollarSign, href: "/admin/orders" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Link key={stat.label} href={stat.href} className="block">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent>
              <div className="flex items-center justify-between">
                <CardTitle>{stat.label}</CardTitle>
                <stat.icon className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Overview of your store&apos;s products, orders and users.
      </p>
      <div className="mt-8">
        <Suspense fallback={<ListSkeleton rows={2} />}>
          <Stats />
        </Suspense>
      </div>
    </div>
  );
}
