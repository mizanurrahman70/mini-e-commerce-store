// Product detail page. Server Component that fetches the product by slug along
// with its reviews. Renders server-side reviews and a client Add-to-Cart +
// review form.

import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/strapi/products";
import { getReviews } from "@/lib/strapi/reviews";
import { productImage } from "@/lib/images";
import { formatPrice, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { ReviewForm } from "@/components/products/ReviewForm";
import { Star } from "lucide-react";
import type { Review } from "@/lib/types";

/** Resolve a display name for a review's author. */
function reviewAuthor(review: Review): string {
  const customer = review.customer;
  if (!customer || typeof customer === "number") return "Customer";
  return customer.username ?? "Customer";
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.data) {
    // If Strapi is unreachable, show an explicit note rather than a raw error.
    if (result.error && result.error !== "Product not found") {
      return <ServiceUnavailable />;
    }
    notFound();
  }

  const product = result.data;
  const image = productImage(product);
  const reviewsResult = await getReviews(product.id);
  const reviews = reviewsResult.data ?? [];

  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center bg-gray-100 text-gray-300">
              No image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <Badge tone="indigo">
              {product.categories?.[0]?.name ?? "General"}
            </Badge>
            {!product.isActive && <Badge tone="warning">Inactive</Badge>}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold text-gray-900">
            {formatPrice(product.price)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {outOfStock ? "Currently out of stock" : `${product.stock} in stock`}
          </p>

          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Description
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-gray-700">
              {product.description}
            </p>
          </div>

          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={product.price}
              imageUrl={image}
              disabled={outOfStock || !product.isActive}
            />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Write a review
            </h3>
            <ReviewForm productId={product.id} />
          </div>

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">
                No reviews yet. Be the first to review this product!
              </p>
            ) : (
              reviews.map((review, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {reviewAuthor(review)}
                    </span>
                    <span className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-4 w-4 ${
                            n <= (review.rating ?? 0)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(review.createdAt)}
                  </p>
                  <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceUnavailable() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-xl font-semibold text-gray-900">
        Service temporarily unavailable
      </h1>
      <p className="mt-2 text-gray-600">
        We couldn&apos;t load this product right now. Please try again shortly.
      </p>
    </div>
  );
}
