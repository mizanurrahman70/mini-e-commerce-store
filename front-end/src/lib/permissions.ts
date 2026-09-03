

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { canByPermissions, type Resource, type Action } from "./permission-rules";

export { normalizeRolePermissions, canByPermissions } from "./permission-rules";
export type { Resource, Action, RolePermissionsMap } from "./permission-rules";


export function usePermission(resource: Resource, action: Action): boolean {
  const { permissions, isLoading } = useContext(AuthContext);
  if (isLoading) return false;
  return canByPermissions(permissions ?? [], resource, action);
}
