"use client";

// Admin order list with inline status updates. Changing status calls the
// updateOrderStatusAction server action (admin only — gated by usePermission
// for UX; Strapi enforces the real rule).

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOrderStatusAction } from "@/lib/actions/orders";
import { usePermission } from "@/lib/permissions";
import { useToast } from "@/context/ToastContext";
import { OrderCard } from "@/components/orders/OrderCard";
import type { Order, OrderStatus } from "@/lib/types";

export function AdminOrdersTable({ orders }: { orders: { id: number; order: Order }[] }) {
  const router = useRouter();
  const toast = useToast();
  const canUpdate = usePermission("order", "update");
  const [busyId, setBusyId] = useState<number | null>(null);
  console.log("AdminOrdersTable orders:", orders);

  async function handleStatusChange(id: number, status: OrderStatus) {
    setBusyId(id);
    const result = await updateOrderStatusAction(id, status);
    setBusyId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Order marked as ${status}`);
    router.refresh();
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
        No orders yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(({ id, order }) => (
        <OrderCard
          key={id}
          id={id}
          order={order}
          onStatusChange={canUpdate ? handleStatusChange : undefined}
          busy={busyId === id}
        />
      ))}
    </div>
  );
}
