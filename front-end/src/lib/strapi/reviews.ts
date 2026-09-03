// Review data-access functions.
import { strapiFetch } from "./client";
import type { ApiResult, Review, StrapiData } from "../types";

/** GET all reviews for a product, populated with the customer. */
export async function getReviews(productId: number): Promise<ApiResult<Review[]>> {
  const res = await strapiFetch<StrapiData<Review[]> & { meta?: unknown }>("/reviews", {
    query: {
      populate: { customer: true, product: true },
      sort: "createdAt:desc",
      filters: { product: { id: { $eq: productId } } },
    },
  });
  if (!res.ok || !res.body) {
    return { data: null, error: res.error ?? "Could not load reviews" };
  }
  return { data: res.body.data, error: null };
}

/** POST /api/reviews — create a review (customer). Sends the JWT. */
export async function createReview(
  data: { product: number; rating: number; comment: string },
  jwt: string
): Promise<ApiResult<Review>> {
  const res = await strapiFetch<StrapiData<Review>>("/reviews", {
    jwt,
    init: {
      method: "POST",
      body: JSON.stringify({ data }),
    },
  });
  if (!res.ok || !res.body) {
    return { data: null, error: res.error ?? "Could not submit review" };
  }
  return { data: res.body.data, error: null };
}
