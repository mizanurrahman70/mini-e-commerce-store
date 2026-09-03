"use server";



import { revalidatePath } from "next/cache";
import {
  createOrder as strapiCreateOrder,
  updateOrderStatus as strapiUpdateOrderStatus,
  type CreateOrderInput,
} from "@/lib/strapi/orders";
import { getServerJwt } from "@/lib/server";
import type { ApiResult, Order, OrderStatus } from "@/lib/types";

/** Create an order on behalf of the logged-in customer. */
export async function createOrderAction(
  input: CreateOrderInput
): Promise<ApiResult<{ id: number; order: Order }>> {
  const jwt = await getServerJwt();
  if (!jwt) return { data: null, error: "You must be logged in to place an order" };

  const result = await strapiCreateOrder(input, jwt);
  if (result.data) revalidatePath("/orders");
  return result;
}

/** Update an order's status (vendor / admin only). */
export async function updateOrderStatusAction(
  id: number,
  status: OrderStatus
): Promise<ApiResult<{ id: number; order: Order }>> {
  const jwt = await getServerJwt();
  if (!jwt) return { data: null, error: "Not authenticated" };

  const result = await strapiUpdateOrderStatus(id, status, jwt);
  if (result.data) {
    revalidatePath("/orders");
    revalidatePath("/admin/orders");
    revalidatePath("/vendor/dashboard");
  }
  return result;
}
