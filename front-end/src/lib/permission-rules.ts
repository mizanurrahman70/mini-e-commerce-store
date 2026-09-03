

export type Resource = "product" | "order" | "review" | "user" | "category";
export type Action = string;

// Normalize an action name from different Strapi conventions to a canonical one.
function canonicalAction(name: string): string {
  switch (name) {
    case "find":
    case "findOne":
      return "read";
    case "create":
      return "create";
    case "update":
      return "update";
    case "delete":
    case "destroy":
      return "delete";
    default:
      return name;
  }
}


function mapResource(api: string, controller: string): Resource | null {
  if (api === "plugin::users-permissions" && controller === "user") return "user";
  const map: Record<string, Resource> = {
    "api::product": "product",
    "api::order": "order",
    "api::review": "review",
    "api::category": "category",
  };
  return map[api] ?? null;
}


export function normalizeRolePermissions(
  raw: RolePermissionsMap | undefined
): string[] {
  if (!raw) return [];
  const keys: string[] = [];
  for (const [api, apiVal] of Object.entries(raw)) {
    for (const [controller, ctrlVal] of Object.entries(apiVal?.controllers ?? {})) {
      const resource = mapResource(api, controller);
      if (!resource) continue;
      for (const [action, def] of Object.entries(ctrlVal)) {
        if (def?.enabled) keys.push(`${resource}:${canonicalAction(action)}`);
      }
    }
  }
  return keys;
}

/** Raw role permissions shape, matches the users-permissions roles API. */
export interface RolePermissionsMap {
  [api: string]: {
    controllers?: { [controller: string]: { [action: string]: { enabled?: boolean } } };
  };
}


function toKey(resource: Resource, action: Action): string {
  const base = action.replace(/:own(?:-products)?$/, "");
  return `${resource}:${base}`;
}


export function canByPermissions(
  permissions: string[] | undefined,
  resource: Resource,
  action: Action
): boolean {
  if (!permissions) return false;
  const key = toKey(resource, action);
  return permissions.includes(key);
}
