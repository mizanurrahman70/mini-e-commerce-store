// proxy.ts (Next.js 16, replaces the old middleware.ts).
// Guards /vendor/* and /admin/* by role using the shared permission rules and
// the companion `strapi_role` cookie. UX convenience only — Strapi enforces
// real authorization (Settings > Roles).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, ROLE_COOKIE } from "@/lib/cookies";
import { can } from "@/lib/permission-rules";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isVendorArea = pathname.startsWith("/vendor/");
  const isAdminArea = pathname.startsWith("/admin/");

  if (!isVendorArea && !isAdminArea) {
    return NextResponse.next();
  }

  const hasJwt = request.cookies.has(AUTH_COOKIE);
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  if (!hasJwt) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  let allowed: boolean;
  if (isAdminArea) {
    allowed = can(role, "user", "read");
  } else {
    allowed = can(role, "product", "create");
  }

  if (!allowed) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/vendor/:path*", "/admin/:path*"],
};
