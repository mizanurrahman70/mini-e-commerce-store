// Central type definitions for all Strapi entities and API responses.
// These mirror the Content-Types configured in the backend (Category, Product,
// Order, Review) plus the Users & Permissions user shape.
//
// NOTE: This backend is Strapi v5, which returns FLAT entity records:
// metadata (id, documentId) and attributes sit side-by-side in one object and
// populated relations/media are raw arrays — there is no { data } / { attributes }
// wrapper around them. Only the collection/single entry top-level keeps
// { data, meta }.

// ---------- Generic response wrapper ----------

/** Top-level collection/single response: { data, meta }. */
export interface StrapiData<T> {
  data: T;
  meta?: Record<string, unknown>;
}

/** Pagination metadata returned by Strapi. */
export interface PaginationMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

// ---------- Media ----------

/** A Strapi media asset (flat). Populated media fields are returned as arrays. */
export interface MediaAsset {
  id: number;
  documentId?: string;
  name?: string;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  formats?: Record<string, { url: string } | undefined>;
}

// ---------- Auth / Users ----------

export interface Role {
  id: number;
  name: string;
  type: string; // e.g. "customer", "vendor", "admin"
  description?: string;
}

export interface User {
  id: number;
  username?: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  role?: Role | null;
  /** Raw role permission map, present when fetched from GET /api/users/me. */
  permissions?: UserPermissionsMap;
}

/** Raw per-type permission map returned by the users-permissions plugin. */
export interface UserPermissionsMap {
  [api: string]: {
    controllers?: {
      [controller: string]: { [action: string]: { enabled?: boolean; policy?: string } };
    };
  };
}

/** Normalized role type used everywhere in the frontend. */
export type RoleType = "customer" | "vendor" | "admin" | "authenticated" | "public" | string;

export interface AuthResponseData {
  user: User;
  permissions?: unknown;
}

/** Response from POST /api/auth/local and /register: JWT + user. */
export interface AuthResponse {
  jwt: string;
  user: User;
}

// ---------- Domain entities ----------

export interface Category {
  id: number;
  documentId?: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  documentId?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  image?: MediaAsset[];
  categories?: Category[];
  vendor?: User | null;
  reviews?: Review[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export interface ShippingAddress {
  street: string;
  city: string;
  phone: string;
}

export interface OrderItem {
  id?: number;
  product?: Product | number | null;
  quantity: number;
  priceAtOrder: number;
}

export interface Order {
  id: number;
  documentId?: string;
  orderNumber?: string;
  totalAmount: number;
  order_status?: OrderStatus;
  items?: OrderItem[];
  shippingAddress?: ShippingAddress | null;
  customer?: User | number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: number;
  documentId?: string;
  customer?: User | number | null;
  product?: Product | number | null;
  rating: number | null;
  comment: string;
  createdAt?: string;
}

// ---------- Consistent API result shape ----------

/** Every function in `lib/strapi/*` returns this shape. */
export type ApiResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };
