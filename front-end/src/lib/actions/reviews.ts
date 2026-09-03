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
}): Promise<ApiResult<Review>> {
  const jwt = await getServerJwt();
  if (!jwt) return { data: null, error: "You must be logged in to review" };

  const result = await strapiCreateReview(payload, jwt);
  if (result.data) revalidatePath(`/products/`);
  return result;
}
