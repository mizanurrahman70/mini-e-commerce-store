// Global site footer with standard links and copyright. Rendered once in the
// root layout.

import Link from "next/link";

const GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { href: "/", label: "All products" },
      { href: "/cart", label: "Cart" },
      { href: "/orders", label: "My orders" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Login" },
      { href: "/register", label: "Register" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm">
                S
              </span>
              Shop<span className="text-indigo-600">ify</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-gray-500">
              A clean, professional e-commerce storefront powered by Next.js and
              Strapi.
            </p>
          </div>

          {GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-gray-900">{group.title}</h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-indigo-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Shopify Demo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
