// Minimal JWT decode helper.
//
// NOTE: This ONLY base64-decodes the payload to read non-sensitive claims like
// the user `id`. It does NOT verify the signature — verification and real
// authorization happen server-side in Strapi. Never trust these claims for
// security decisions; use them only for UI / query shaping.

export interface JwtPayload {
  id: number;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    // Replace URL-safe base64 chars and pad, then decode UTF-8.
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}
