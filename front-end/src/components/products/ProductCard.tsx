"use client";

// Single product card for the shop grid. Links to the product detail page by
// slug, shows the image, price and category, and offers Add to Cart. The add
// button uses the permission map only to avoid showing a useless button when a
// product is out of stock — adding to cart itself is a customer action.

import Link from "next/link";
import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { nameToSlug } from "@/lib/strapi/products";
import { productImage } from "@/lib/images";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import type { ProductWithId } from "@/lib/strapi/products";

export function ProductCard({ product }: { product: ProductWithId }) {
  const { addItem } = useCart();
  const toast = useToast();
  const image = productImage(product);
  const outOfStock = product.stock <= 0;
  const href = `/products/${nameToSlug(product.name)}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={href}
        className="relative block aspect-square w-full overflow-hidden bg-gray-100"
      >
        {image ? (
          // Plain <img> because Strapi assets come from a dynamic external host.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            No image
          </div>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2">
            <Badge tone="danger">Out of stock</Badge>
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-400">
            {product.categories?.[0]?.name ?? "General"}
          </span>
        </div>
        <Link href={href}>
          <h3 className="line-clamp-2 font-medium text-gray-900 hover:text-indigo-600">
            {product.name}
          </h3>
        </Link>
        <p className="mt-auto pt-2 text-lg font-semibold text-gray-900">
          {formatPrice(product.price)}
        </p>
        <button
          disabled={outOfStock}
          onClick={() => {
            addItem({
              productId: product.id,
              name: product.name,
              price: product.price,
              imageUrl: image,
            });
            toast.success(`${product.name} added to cart`);
          }}
          className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          <Plus className="h-4 w-4" />
          Add to cart
        </button>
      </div>
    </div>
  );
}
