// Shared cookie name constants. This module has no server-only imports so it
// can be referenced by server actions AND by proxy.ts. Note: only the JWT
// cookie is httpOnly; the role cookie is read by the proxy for route guarding.
export const AUTH_COOKIE = process.env.AUTH_COOKIE_NAME ?? "strapi_jwt";
export const ROLE_COOKIE = "strapi_role";
