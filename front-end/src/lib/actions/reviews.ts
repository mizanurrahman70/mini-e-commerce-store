"use server";

// Server Actions for review mutations. Reads the httpOnly JWT cookie server-side.

import { revalidatePath } from "next/cache";
import { createReview as strapiCreateReview } from "@/lib/strapi/reviews";
import { getServerJwt } from "@/lib/server";
import type { ApiResult, Review } from "@/lib/types";

/** Create a review for a product (customer). */
export async function createReviewAction(payload: {
  product: number;
  rating: number;
  comment: string;
  /** Product page path (e.g. `/products/my-product`) to revalidate after submit. */
  path?: string;
}): Promise<ApiResult<Review>> {
  const jwt = await getServerJwt();
  if (!jwt) return { data: null, error: "You must be logged in to review" };

  // Only the review fields belong in the Strapi payload — `path` is used purely
  // for revalidation and must not be sent (Strapi rejects unknown keys).
  const result = await strapiCreateReview(
    { product: payload.product, rating: payload.rating, comment: payload.comment },
    jwt
  );
  if (result.data) {
    revalidatePath(payload.path ?? "/products");
  }
  return result;
}
