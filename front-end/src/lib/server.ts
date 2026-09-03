"server only";

// Server-only helper to read the authenticated user's JWT from the httpOnly
// cookie. Used by Server Components / Actions that need to call protected
// Strapi endpoints with the user's identity. Because it uses `cookies()` from
// next/headers, it can only run on the server.

import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/cookies";

/** Return the JWT from the httpOnly cookie, or null if not logged in. */
export async function getServerJwt(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value ?? null;
}

/** Return true if the user has a session cookie (does not validate it). */
export async function hasSessionCookie(): Promise<boolean> {
  const store = await cookies();
  return store.has(AUTH_COOKIE);
}
