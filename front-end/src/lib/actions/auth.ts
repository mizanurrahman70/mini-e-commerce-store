"use server";

import { cookies } from "next/headers";
import { login as strapiLogin, register as strapiRegister, getMe } from "@/lib/strapi/auth";
import { AUTH_COOKIE, ROLE_COOKIE } from "@/lib/cookies";
import { normalizeRolePermissions } from "@/lib/permission-rules";
import type { Credentials, RegisterInput } from "@/lib/strapi/auth";
import type { User } from "@/lib/types";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function roleType(user: User): string {
  return user.role?.type ?? "authenticated";
}

/** Normalize the role permission map (already on the user from /users/me). */
function normalizeUserPermissions(user: User): string[] | undefined {
  if (!user.permissions) return undefined;
  const keys = normalizeRolePermissions(user.permissions);
  return keys.length ? keys : undefined;
}

type Session = {
  user: User | null;
  role: string | undefined;
  permissions: string[] | undefined;
  error: string | null;
};

/**
 * Set auth cookies and hydrate the session from GET /api/users/me, which the
 * backend extension enriches with `role` + `permissions`. Always re-fetches so
 * login/register responses (which lack permissions) get the full user too.
 */
async function establishSession(jwt: string): Promise<Session> {
  const store = await cookies();

  if (!jwt) {
    store.delete(AUTH_COOKIE);
    store.delete(ROLE_COOKIE);
    return { user: null, role: undefined, permissions: undefined, error: "Not authenticated" };
  }

  const me = await getMe(jwt);
  if (me.error || !me.data) {
    store.delete(AUTH_COOKIE);
    store.delete(ROLE_COOKIE);
    return { user: null, role: undefined, permissions: undefined, error: me.error ?? null };
  }

  const user = me.data;
  store.set(AUTH_COOKIE, jwt, { ...cookieBase(), maxAge: COOKIE_MAX_AGE });
  store.set(ROLE_COOKIE, roleType(user), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return {
    user,
    role: roleType(user),
    permissions: normalizeUserPermissions(user),
    error: null,
  };
}

export type SessionUser = User;

export type LoginResult = {
  data: null;
  error: string | null;
  user?: SessionUser;
  role?: string;
  permissions?: string[];
};

export async function loginAction(credentials: Credentials): Promise<LoginResult> {
  const result = await strapiLogin(credentials);
  if (result.error || !result.data) {
    return { data: null, error: result.error ?? "Invalid credentials" };
  }
  const session = await establishSession(result.data.jwt);
  if (session.error || !session.user) {
    return { data: null, error: session.error ?? "Invalid credentials" };
  }
  return { data: null, error: null, user: session.user, role: session.role, permissions: session.permissions };
}

export type RegisterResult = {
  data: null;
  error: string | null;
  user?: SessionUser;
  role?: string;
  permissions?: string[];
};

export async function registerAction(input: RegisterInput): Promise<RegisterResult> {
  const result = await strapiRegister(input);
  if (result.error || !result.data) {
    return { data: null, error: result.error ?? "Registration failed" };
  }
  const session = await establishSession(result.data.jwt);
  if (session.error || !session.user) {
    return { data: null, error: session.error ?? "Registration failed" };
  }
  return { data: null, error: null, user: session.user, role: session.role, permissions: session.permissions };
}

export type LogoutResult = { error: string | null };

export async function logoutAction(): Promise<LogoutResult> {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
  store.delete(ROLE_COOKIE);
  return { error: null };
}

export type SessionResult = {
  data: SessionUser | null;
  error: string | null;
  role?: string;
  permissions?: string[];
};

export async function getSessionAction(): Promise<SessionResult> {
  const store = await cookies();
  const jwt = store.get(AUTH_COOKIE)?.value;
  if (!jwt) return { data: null, error: null, role: undefined, permissions: undefined };

  const session = await establishSession(jwt);
  return {
    data: session.user,
    error: session.error,
    role: session.role,
    permissions: session.permissions,
  };
}
