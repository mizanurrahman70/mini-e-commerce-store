// Category data-access functions.
import { strapiFetch } from "./client";
import type { ApiResult, Category, StrapiData } from "../types";

/** GET /api/categories — used to populate product form dropdowns. */
export async function getCategories(): Promise<ApiResult<Category[]>> {
  const res = await strapiFetch<StrapiData<Category[]>>("/categories", {
    query: { sort: "name:asc" },
  });
  if (!res.ok || !res.body) {
    return { data: null, error: res.error ?? "Could not load categories" };
  }
  return { data: res.body.data, error: null };
}
