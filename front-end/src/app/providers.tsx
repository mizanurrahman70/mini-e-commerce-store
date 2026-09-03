"use client";

// Wraps the app in all client-side providers. Kept as a client component so the
// root layout (a Server Component) can stay server-side while still providing
// auth, cart and toast state to the tree.
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
