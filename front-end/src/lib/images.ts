// Helper to build absolute URLs for Strapi media assets. Strapi returns
// relative paths like "/uploads/foo.png"; we prefix the configured STRAPI_URL.

import type { Product } from "@/lib/types";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

/**
 * Resolve a Strapi media URL to an absolute URL the browser can load.
 * Pass the media `attributes.url` (or a format's `url`).
 */
export function imageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${STRAPI_URL}${path}`;
}

/**
 * Resolve a product's image to a usable URL, preferring a medium-size format
 * if available and falling back to the original file. Product `image` is a raw
 * array of media assets (Strapi v5).
 */
export function productImage(product: Pick<Product, "image">): string | undefined {
  const first = product.image?.[0];
  if (!first) return undefined;
  const url = first.formats?.medium?.url ?? first.url;
  return imageUrl(url ?? first.url);
}

/** Resolve a raw media URL string to an absolute URL. */
export function mediaUrl(url: string | null | undefined): string | undefined {
  return imageUrl(url);
}
