"use server";

// Server Actions for product mutations. Reads the httpOnly JWT cookie so the
// client never handles the token. These respect the role rules defined in
// lib/permissions.ts for UX only; Strapi enforces the real authorization.

import { revalidatePath } from "next/cache";
import {
  createProduct as strapiCreateProduct,
  updateProduct as strapiUpdateProduct,
  deleteProduct as strapiDeleteProduct,
} from "@/lib/strapi/products";
import { getServerJwt } from "@/lib/server";
import { decodeJwt } from "@/lib/jwt";
import type { ApiResult, Product } from "@/lib/types";

export interface ProductPayload {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
  categories?: number[];
  vendor?: number | null;
}

/** Create a product (vendor / admin). Assigns the current user as vendor. */
export async function createProductAction(
  payload: ProductPayload
): Promise<ApiResult<Product>> {
  const jwt = await getServerJwt();
  if (!jwt) return { data: null, error: "Not authenticated" };

  const data: Record<string, unknown> = { ...payload };
  if (payload.categories) data.categories = payload.categories;

  // Default the vendor to the current user so vendors don't have to specify it.
  if (payload.vendor != null) {
    data.vendor = payload.vendor;
  } else {
    const me = decodeJwt(jwt);
    if (me?.id) data.vendor = me.id;
  }

  const result = await strapiCreateProduct(data, jwt);
  if (result.data) revalidatePath("/");
  return result;
}

/** Update a product (vendor own / admin). */
export async function updateProductAction(
  id: number,
  payload: ProductPayload
): Promise<ApiResult<Product>> {
  const jwt = await getServerJwt();
  if (!jwt) return { data: null, error: "Not authenticated" };

  const data: Record<string, unknown> = { ...payload };
  if (payload.categories) data.categories = payload.categories;
  if (payload.vendor != null) data.vendor = payload.vendor;

  const result = await strapiUpdateProduct(id, data, jwt);
  if (result.data) {
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/vendor/dashboard");
  }
  return result;
}

/** Delete a product (admin only). */
export async function deleteProductAction(
  id: number
): Promise<ApiResult<null>> {
  const jwt = await getServerJwt();
  if (!jwt) return { data: null, error: "Not authenticated" };

  const result = await strapiDeleteProduct(id, jwt);
  if (!result.error) {
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/vendor/dashboard");
  }
  return result;
}
