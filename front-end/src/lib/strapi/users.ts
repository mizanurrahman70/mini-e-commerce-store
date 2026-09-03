// User data-access functions (admin only).
import { strapiFetch } from "./client";
import type { ApiResult, RoleType, User } from "../types";

/** GET /api/users?populate=role — list users (admin). Sends the JWT. */
export async function getUsers(jwt: string): Promise<ApiResult<User[]>> {
  const res = await strapiFetch<User[]>("/users", {
    jwt,
    query: { populate: "role", sort: "createdAt:desc" },
  });
  if (!res.ok || !res.body) {
    return { data: null, error: res.error ?? "Could not load users" };
  }
  return { data: res.body, error: null };
}

/** Extract the normalized role type from a user, for display. */
export function roleName(user: { role?: User["role"] }): RoleType {
  return user.role?.type ?? "authenticated";
}
