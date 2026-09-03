// Low-level Strapi auth API calls. These are pure data-access functions and do
// NOT set cookies — cookie management lives in the server actions
// (`src/lib/actions/auth.ts`) so it stays out of client bundles.
import { strapiFetch } from "./client";
import type { ApiResult, AuthResponse, User } from "../types";

export interface Credentials {
  identifier: string; // email or username
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

/** POST /api/auth/local — exchange credentials for a JWT + user. */
export async function login(
  credentials: Credentials
): Promise<ApiResult<AuthResponse>> {
  const res = await strapiFetch<AuthResponse>("/auth/local", {
    init: {
      method: "POST",
      body: JSON.stringify(credentials),
    },
  });
  if (!res.ok || !res.body) return { data: null, error: res.error ?? "Login failed" };
  return { data: res.body, error: null };
}

/** POST /api/auth/local/register — create a new user and receive a JWT. */
export async function register(
  input: RegisterInput
): Promise<ApiResult<AuthResponse>> {
  const res = await strapiFetch<AuthResponse>("/auth/local/register", {
    init: {
      method: "POST",
      body: JSON.stringify({
        username: input.username,
        email: input.email,
        password: input.password,
      }),
    },
  });
  if (!res.ok || !res.body) {
    return { data: null, error: res.error ?? "Registration failed" };
  }
  return { data: res.body, error: null };
}

/**
 * GET /api/users/me — returns the logged-in user with their role and
 * permissions already inflated by the backend extension (see the backend's
 * `src/extensions/users-permissions/strapi-server.js`). The response is the
 * bare user object (NOT wrapped in `{ data: ... }`).
 */
export async function getMe(jwt: string): Promise<ApiResult<User>> {
  const res = await strapiFetch<User>("/users/me", { jwt });
  if (!res.ok || !res.body) return { data: null, error: res.error ?? "Session expired" };
  return { data: res.body, error: null };
}

/**
 * GET /api/users-permissions/roles/:id — fetch a role's id + type + the real
 * permissions configured in Settings > Roles. NOTE: regular (non-admin) users
 * get a 403 from this endpoint; prefer the permissions on GET /api/users/me.
 */
export async function getRoleById(
  roleId: number,
  jwt: string
): Promise<ApiResult<RoleRecord>> {
  const res = await strapiFetch<{ role: RoleRecord }>(`/users-permissions/roles/${roleId}`, {
    jwt,
  });
  if (!res.ok || !res.body) {
    return { data: null, error: res.error ?? "Could not load role permissions" };
  }
  return { data: res.body.role, error: null };
}

/** Raw shape of a role record from the users-permissions plugin. */
export interface RoleRecord {
  id: number;
  name?: string;
  type?: string;
  permissions?: Record<
    string,
    { controllers?: Record<string, Record<string, { enabled?: boolean }>> }
  >;
}
