// UI permission helpers. gating only — Strapi enforces real access.

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { can, canByPermissions, type Resource, type Action } from "./permission-rules";

export { PERMISSIONS, can, normalizeRolePermissions } from "./permission-rules";
export type { Resource, Action, RolePermissionsMap } from "./permission-rules";

/** Check an action against the user's real (backend) permissions, falling back to the static role map. */
export function usePermission(resource: Resource, action: Action): boolean {
  const { role, permissions, isLoading } = useContext(AuthContext);
  if (isLoading) return false;
  if (permissions) return canByPermissions(permissions, resource, action);
  return can(role, resource, action);
}
