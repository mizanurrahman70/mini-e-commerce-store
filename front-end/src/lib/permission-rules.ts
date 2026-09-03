// Role permission rules, framework-agnostic (safe for server + client + proxy).

export type Resource = "product" | "order" | "review" | "user" | "category";
export type Action = string;

// Static fallback map: role -> allowed actions per resource. The real source
// of truth is Strapi's Settings > Roles; this is only used as a fallback or
// when backend permissions aren't available.
export const PERMISSIONS: Record<Resource, Record<string, Action[]>> = {
  product: {
    customer: ["read"],
    vendor: ["read", "create", "update:own"],
    admin: ["read", "create", "update", "delete"],
    public: ["read"],
  },
  order: {
    customer: ["read:own", "create"],
    vendor: ["read:own-products"],
    admin: ["read", "update", "delete"],
  },
  review: {
    customer: ["create", "read"],
    vendor: ["read"],
    admin: ["read", "delete"],
  },
  user: {
    admin: ["read", "update", "delete"],
  },
  category: {
    admin: ["read", "create", "update", "delete"],
    vendor: ["read"],
    customer: ["read"],
    public: ["read"],
  },
};

export function can(
  role: string | null | undefined,
  resource: Resource,
  action: Action
): boolean {
  if (!role) return false;
  const perms = PERMISSIONS[resource];
  if (!perms) return false;
  if (perms[role]?.includes(action)) return true;
  // Unknown custom role -> treat as a customer baseline.
  if (!["authenticated", "customer", "vendor", "admin", "public"].includes(role)) {
    return (perms["authenticated"] ?? perms["customer"] ?? []).includes(action);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Backend-driven permissions
// ---------------------------------------------------------------------------

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

// Map a Strapi API key + controller to our Resource. Returns null to ignore
// unrelated plugins (upload, email, i18n, content-type-builder, etc.).
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

/**
 * Convert raw Strapi role permissions (from /users-permissions/roles/:id) into
 * a flat list of `"resource:action"` keys, e.g. ["product:read", "product:create"].
 * Used so the UI honors the REAL backend config rather than a hardcoded map.
 */
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

/**
 * Map a frontend action ("read:own", "update:own") to its backend action key.
 */
function toKey(resource: Resource, action: Action): string {
  const base = action.replace(/:own(?:-products)?$/, "");
  return `${resource}:${base}`;
}

/**
 * Check an action against a list of backend permission keys (from
 * normalizeRolePermissions). True if a matching key is present.
 */
export function canByPermissions(
  permissions: string[] | undefined,
  resource: Resource,
  action: Action
): boolean {
  if (!permissions) return false;
  const key = toKey(resource, action);
  return permissions.includes(key);
}
