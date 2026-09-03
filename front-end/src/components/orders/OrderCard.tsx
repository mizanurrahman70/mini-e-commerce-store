"use client";

// Presentational order card. Shows order number, status, date, shipping
// address, item lines, and total. When passed an `onStatusChange` callback
// (admin / vendor views) it also renders a status dropdown.

import { Package, Truck } from "lucide-react";
import { Badge, orderStatusTone } from "@/components/ui/Badge";
import { formatPrice, formatDate } from "@/lib/format";
import type { Order, OrderStatus, OrderItem } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

interface OrderCardProps {
  id: number;
  order: Order;
  /** When provided, renders the status control (admin/vendor only). */
  onStatusChange?: (id: number, status: OrderStatus) => void;
  /** When set, disables the status control (e.g. while a request is pending). */
  busy?: boolean;
}

function itemLabel(item: OrderItem): string {
  if (typeof item.product === "object" && item.product) return item.product.name;
  if (typeof item.product === "number") return `Product #${item.product}`;
  return "Product";
}

export function OrderCard({ id, order, onStatusChange, busy }: OrderCardProps) {
  const status = order.order_status ?? "Pending";
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900">
              #{order.orderNumber ?? id}
            </span>
            <Badge tone={orderStatusTone(status)}>{status}</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {formatDate(order.createdAt)}
          </p>
        </div>

        {onStatusChange && (
          <select
            value={status}
            disabled={busy}
            onChange={(e) => onStatusChange(id, e.target.value as OrderStatus)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Shipping address */}
      {order.shippingAddress && (
        <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <span>
            {order.shippingAddress.street}, {order.shippingAddress.city} ·{" "}
            {order.shippingAddress.phone}
          </span>
        </div>
      )}

      {/* Items */}
      <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
        {(order.items ?? []).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 text-sm">
            <span className="flex items-center gap-2 text-gray-700">
              <Package className="h-4 w-4 text-gray-400" />
              {itemLabel(item)}
              <span className="text-gray-400">× {item.quantity}</span>
            </span>
            <span className="font-medium text-gray-900">
              {formatPrice(item.priceAtOrder * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-sm text-gray-500">Total</span>
        <span className="text-lg font-semibold text-gray-900">
          {formatPrice(order.totalAmount)}
        </span>
      </div>
    </div>
  );
}
