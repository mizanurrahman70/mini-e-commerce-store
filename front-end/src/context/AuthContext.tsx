"use client";

// AuthContext holds the current user, their role, and the auth actions
// (login / logout / register). The JWT itself never lives here — it is stored
// in an httpOnly cookie managed by server actions in lib/actions/auth.ts.
// This context only keeps the derived, non-sensitive session info.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getSessionAction,
  loginAction,
  logoutAction,
  registerAction,
  type SessionUser,
} from "@/lib/actions/auth";
import type { Credentials, RegisterInput } from "@/lib/strapi/auth";
import { toast } from "@/context/ToastContext";

interface AuthContextValue {
  user: SessionUser | null;
  role: string | null;
  /** Backend-derived permission keys, e.g. ["product:read", ...]. */
  permissions: string[] | null;
  isLoading: boolean;
  login: (credentials: Credentials) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  permissions: null,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
});

/** Convenience hook for consuming auth state. */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first mount, hydrate the session from the httpOnly cookie by asking the
  // server action to validate it against Strapi.
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await getSessionAction();
      if (!active) return;
      if (result.data) {
        setUser(result.data);
        setRole(result.role ?? null);
        setPermissions(result.permissions ?? null);
      }
      setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const result = await loginAction(credentials);
    if (result.error || !result.user) {
      toast.error(result.error ?? "Login failed");
      return false;
    }
    setUser(result.user);
    setRole(result.role ?? null);
    setPermissions(result.permissions ?? null);
    return true;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await registerAction(input);
    if (result.error || !result.user) {
      toast.error(result.error ?? "Registration failed");
      return false;
    }
    setUser(result.user);
    setRole(result.role ?? null);
    setPermissions(result.permissions ?? null);
    return true;
  }, []);

  const logout = useCallback(async () => {
    await logoutAction();
    setUser(null);
    setRole(null);
    setPermissions(null);
    toast.success("Logged out");
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, permissions, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
