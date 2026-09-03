"use client";

// CartContext manages a lightweight client-side cart persisted to localStorage.
// It uses useSyncExternalStore so the store is read from (and hydrated from)
// localStorage with proper SSR support: during server rendering the snapshot is
// the empty cart, which keeps server/client HTML identical and avoids hydration
// mismatches. Mutations go through the store which persists to localStorage.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clear: () => {},
  count: 0,
  subtotal: 0,
});

const STORAGE_KEY = "mini-ecom-cart";

// --- External store (module-scope) -----------------------------------------

let cartItems: CartItem[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  cartItems = readStorage();
}

function emit() {
  for (const listener of listeners) listener();
}

function commit(next: CartItem[]) {
  cartItems = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage full / unavailable */
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): CartItem[] {
  ensureLoaded();
  return cartItems;
}

const EMPTY: CartItem[] = [];

// Server snapshot — always empty so the server-rendered HTML matches the
// client's initial (un-hydrated) render, preventing mismatch errors.
function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

// --- Hook + Provider -------------------------------------------------------

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    commit(replaceItem(cartItems, item, quantity));
  }, []);

  const removeItem = useCallback((productId: number) => {
    commit(cartItems.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    commit(
      quantity <= 0
        ? cartItems.filter((i) => i.productId !== productId)
        : cartItems.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clear = useCallback(() => commit([]), []);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Add/merge an item by product id (reuses existing quantity and increments it).
function replaceItem(
  prev: CartItem[],
  item: Omit<CartItem, "quantity">,
  quantity: number
): CartItem[] {
  const existing = prev.find((i) => i.productId === item.productId);
  if (existing) {
    return prev.map((i) =>
      i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i
    );
  }
  return [...prev, { ...item, quantity }];
}
