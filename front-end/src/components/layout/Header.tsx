"use client";


import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, LogIn, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { usePermission } from "@/lib/permissions";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/orders", label: "Orders" },
];

export function Header() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const { count } = useCart();
  const router = useRouter();

  const canVendor = usePermission("product", "create");
  const canAdmin = usePermission("user", "read");

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <ShoppingCart className="h-4 w-4" />
          </span>
          Shop<span className="text-indigo-600">ify</span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Role-based dashboard links (UX only — see permissions.ts) */}
          {canVendor && (
            <Link
              href="/vendor/dashboard"
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith("/vendor")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Vendor
            </Link>
          )}
          {canAdmin && (
            <Link
              href="/admin/dashboard"
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            aria-label={`Cart (${count} items)`}
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-md bg-gray-200" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="hidden rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 sm:inline-block"
              >
                {user.username ?? user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
