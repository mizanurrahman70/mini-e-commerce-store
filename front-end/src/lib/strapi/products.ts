
import { strapiFetch } from "./client";
import type { ApiResult, PaginationMeta, Product, StrapiData } from "../types";


export type ProductWithId = Product;

export interface ProductFilters {
  categorySlug?: string;
  isActive?: boolean;
  search?: string;
  vendorId?: number;
  page?: number;
  pageSize?: number;
  sort?: string;
}

const PRODUCT_POPULATE = {
  image: true,
  categories: true,
  vendor: true,
};

export async function getProducts(
  filters: ProductFilters = {}
): Promise<ApiResult<{ products: ProductWithId[]; meta: PaginationMeta }>> {
  const query: Record<string, unknown> = {
    populate: PRODUCT_POPULATE,
    sort: filters.sort ?? "createdAt:desc",
    pagination: {
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 12,
    },
  };

  const strapiFilters: Record<string, unknown> = {};
  if (filters.categorySlug) {
    strapiFilters.categories = { slug: { $eq: filters.categorySlug } };
  }
  if (typeof filters.isActive === "boolean") {
    strapiFilters.isActive = { $eq: filters.isActive };
  }
  if (filters.search) {
    strapiFilters.name = { $containsi: filters.search };
  }
  if (filters.vendorId) {
    strapiFilters.vendor = { id: { $eq: filters.vendorId } };
  }
  if (Object.keys(strapiFilters).length > 0) {
    query.filters = strapiFilters;
  }

  const res = await strapiFetch<StrapiData<Product[]> & PaginationMeta>("/products", {
    query,
  });
  if (!res.ok || !res.body) {
    return { data: null, error: res.error ?? "Could not load products" };
  }
  return {
    data: { products: res.body.data, meta: res.body.meta ?? {} },
    error: null,
  };
}


export async function getProductBySlug(slug: string): Promise<ApiResult<Product>> {
  const query = {
    populate: {
      image: true,
      categories: true,
      vendor: true,
      reviews: true,
    },
    pagination: { pageSize: 1 },
    filters: { name: { $eqi: slugToName(slug) } },
  };

  const res = await strapiFetch<StrapiData<Product[]>>("/products", { query });
  if (!res.ok || !res.body || res.body.data.length === 0) {
    return { data: null, error: res.error ?? "Product not found" };
  }
  return { data: res.body.data[0], error: null };
}

/** Convert a URL slug like "classic-t-shirt" back into a displayable name. */
export function slugToName(slug: string): string {
  return slug.replace(/-/g, " ");
}

/** Convert a product name into a URL slug. Used to build `/products/[slug]`. */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** POST /api/products — create a product (vendor / admin). Sends the JWT. */
export async function createProduct(
  data: Record<string, unknown>,
  jwt: string
): Promise<ApiResult<Product>> {
  const res = await strapiFetch<StrapiData<Product>>("/products", {
    jwt,
    init: { method: "POST", body: JSON.stringify({ data }) },
  });
  if (!res.ok || !res.body) return { data: null, error: res.error ?? "Could not create product" };
  return { data: res.body.data, error: null };
}


export async function updateProduct(
  id: number,
  data: Record<string, unknown>,
  jwt: string
): Promise<ApiResult<Product>> {
  const res = await strapiFetch<StrapiData<Product>>(`/products/${id}`, {
    jwt,
    init: { method: "PUT", body: JSON.stringify({ data }) },
  });
  if (!res.ok || !res.body) return { data: null, error: res.error ?? "Could not update product" };
  return { data: res.body.data, error: null };
}

/** DELETE /api/products/:id — delete a product (admin). Sends the JWT. */
export async function deleteProduct(
  id: number,
  jwt: string
): Promise<ApiResult<null>> {
  const res = await strapiFetch<{ data: unknown }>(`/products/${id}`, {
    jwt,
    init: { method: "DELETE" },
  });
  if (!res.ok) return { data: null, error: res.error ?? "Could not delete product" };
  return { data: null, error: null };
}
