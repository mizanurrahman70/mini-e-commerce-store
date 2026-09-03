

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, ROLE_COOKIE } from "@/lib/cookies";
import {
  canByPermissions,
  normalizeRolePermissions,
  type Resource,
  type Action,
  type RolePermissionsMap,
} from "@/lib/permission-rules";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isVendorArea = pathname.startsWith("/vendor/");
  const isAdminArea = pathname.startsWith("/admin/");

  if (!isVendorArea && !isAdminArea) {
    return NextResponse.next();
  }

  const jwt = request.cookies.get(AUTH_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  if (!jwt) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Admin area -> "can read users" (only admins have it). Vendor area ->
  // "can create products" (vendors + admins). Both resolved from the user's
  // live Strapi permissions when reachable.
  const allowed = isAdminArea
    ? await gate(jwt, role, "user", "read")
    : await gate(jwt, role, "product", "create");

  if (!allowed) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/vendor/:path*", "/admin/:path*"],
};

/**
 * Resolve the user's real permissions from Strapi (GET /users/me) and check the
 * action against them. When the backend is unreachable or returns no
 * permissions, the route is DENIED (fail closed) — there is no static fallback.
 */
async function gate(
  jwt: string,
  _role: string | undefined,
  resource: Resource,
  action: Action
): Promise<boolean> {
  const permissions = await loadUserPermissions(jwt);
  return canByPermissions(permissions ?? [], resource, action);
}

async function loadUserPermissions(jwt: string): Promise<string[] | null> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { permissions?: RolePermissionsMap };
    const raw = body?.permissions;
    return raw ? normalizeRolePermissions(raw) : null;
  } catch {
    return null;
  }
}
