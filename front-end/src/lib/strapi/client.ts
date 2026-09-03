// Base fetch wrapper for the Strapi API.
//
// All non-trivial query building (filters, populate, sort, pagination) must go
// through the `qs` package — never hand-write query strings. The only exception
// is the trivial `populate=*` shorthand.
//
// This module is intentionally environment-agnostic (no `'use server'`), so it
// can be imported from both Server Components/actions and Client Components.
import qs from "qs";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

/** Options shared by every Strapi request. */
export interface StrapiRequestOptions {
  /** JWT sent as `Authorization: Bearer <token>`. */
  jwt?: string;
  /** Query params, stringified with `qs`. */
  query?: Record<string, unknown>;
  /** Raw `qs` stringify options (rarely needed). */
  queryOptions?: qs.IStringifyOptions;
}

export class StrapiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "StrapiError";
    this.status = status;
  }
}

/**
 * Build a full URL for a Strapi endpoint, stringifying any query object with
 * `qs`. This is where ALL query construction happens so callers never build
 * query strings by hand.
 */
export function buildUrl(
  path: string,
  query?: Record<string, unknown>,
  queryOptions?: qs.IStringifyOptions
): string {
  const base = `${STRAPI_URL}/api${path}`;
  if (!query) return base;
  const q = qs.stringify(query, {
    encodeValuesOnly: true, // Strapi wants `[`, `]` etc. left as-is
    ...queryOptions,
  });
  return q ? `${base}?${q}` : base;
}

/**
 * Core request helper. Every read/write call funnels through here so that:
 *   - the `Authorization: Bearer` header is always attached when a jwt is given
 *   - errors are normalized into `{ data, error }` results
 *   - network failures (Strapi down) are caught and surfaced as friendly errors
 */
export async function strapiFetch<T>(
  path: string,
  options: StrapiRequestOptions & { init?: RequestInit } = {}
): Promise<{ ok: boolean; status: number; body: T | null; error: string | null }> {
  const { jwt, query, queryOptions, init = {} } = options;

  const url = buildUrl(path, query, queryOptions);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      // Never cache Strapi responses by default — product stock, prices and
      // order state change frequently and each request reflects live data.
      cache: "no-store",
    });

    if (!res.ok) {
      // Try to surface the most useful message from Strapi's error body.
      let message = `Request failed with status ${res.status}`;
      try {
        const body = await res.json();
        message = body?.error?.message ?? body?.message ?? message;
      } catch {
        /* non-JSON error body — keep the generic message */
      }
      return { ok: false, status: res.status, body: null, error: message };
    }

    const body = (await res.json()) as T;
    return { ok: true, status: res.status, body, error: null };
  } catch (err) {
    // fetch throws on network-level failures (e.g. backend unreachable).
    const message =
      err instanceof Error ? err.message : "Unable to reach the server";
    return { ok: false, status: 0, body: null, error: message };
  }
}
