// Order data-access functions. Reads that need the current user are passed an
// explicit `jwt` so the backend scopes results to the caller.
import { strapiFetch } from "./client";
import type { ApiResult, Order, OrderStatus, StrapiData } from "../types";

const ORDER_POPULATE = {
  customer: true,
  items: { populate: ["product"] },
};

export interface CreateOrderInput {
  items: { product: number; quantity: number }[];
  shippingAddress: { street: string; city: string; phone: string };
}

function normalize(order: Order): { id: number; order: Order } {
  return { id: order.id, order };
}

/** GET /api/orders?filters...&sort... — admin view of all orders. */
export async function getOrders(
  jwt: string,
  query: Record<string, unknown> = {}
): Promise<ApiResult<{ id: number; order: Order }[]>> {
  const res = await strapiFetch<StrapiData<Order[]> & { meta?: unknown }>("/orders", {
    jwt,
    query: {
      populate: ORDER_POPULATE,
      sort: "createdAt:desc",
      ...query,
    },
  });
  if (!res.ok || !res.body) {
    return { data: null, error: res.error ?? "Could not load orders" };
  }
  return { data: res.body.data.map(normalize), error: null };
}

/**
 * GET /api/orders?meOnly=true — the logged-in user's orders, scoped
 * server-side by the backend order controller (the content API cannot filter
 * the `customer` relation directly in Strapi v5).
 */
export async function getMyOrders(
  jwt: string
): Promise<ApiResult<{ id: number; order: Order }[]>> {
  const res = await strapiFetch<StrapiData<Order[]> & { meta?: unknown }>("/orders", {
    jwt,
    query: {
      meOnly: "true",
    },
  });
  if (!res.ok || !res.body) {
    return { data: null, error: res.error ?? "Could not load your orders" };
  }
  return { data: res.body.data.map(normalize), error: null };
}

/** POST /api/orders — create an order (customer). Sends the JWT. */
export async function createOrder(
  data: CreateOrderInput,
  jwt: string
): Promise<ApiResult<{ id: number; order: Order }>> {
  const res = await strapiFetch<StrapiData<Order>>("/orders", {
    jwt,
    init: {
      method: "POST",
      body: JSON.stringify({
        data: {
          items: data.items.map((it) => ({
            product: it.product,
            quantity: it.quantity,
          })),
          shippingAddress: data.shippingAddress,
        },
      }),
    },
  });
  if (!res.ok || !res.body) {
    return { data: null, error: res.error ?? "Could not place order" };
  }
  return { data: normalize(res.body.data), error: null };
}

/** PATCH /api/orders/:id — update order status (vendor/admin only). Sends JWT. */
export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
  jwt: string
): Promise<ApiResult<{ id: number; order: Order }>> {
  const res = await strapiFetch<StrapiData<Order>>(`/orders/${id}`, {
    jwt,
    init: {
      method: "PATCH",
      body: JSON.stringify({ data: { order_status: status } }),
    },
  });
  if (!res.ok || !res.body) {
    return { data: null, error: res.error ?? "Could not update order" };
  }
  return { data: normalize(res.body.data), error: null };
}
