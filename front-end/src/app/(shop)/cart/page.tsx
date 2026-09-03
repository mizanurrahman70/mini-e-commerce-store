"use client";

// Cart page: list items, adjust quantities, and place an order. Order creation
// goes through a server action (the JWT is httpOnly server-side).

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { createOrderAction } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear, subtotal } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.info("Please log in to place an order");
      router.push(`/login?redirect=/cart`);
      return;
    }
    const next: Record<string, string> = {};
    if (!street.trim()) next.street = "Street is required";
    if (!city.trim()) next.city = "City is required";
    if (!phone.trim()) next.phone = "Phone is required";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    const result = await createOrderAction({
      items: items.map((i) => ({ product: i.productId, quantity: i.quantity })),
      shippingAddress: { street: street.trim(), city: city.trim(), phone: phone.trim() },
    });
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    clear();
    toast.success("Order placed successfully!");
    router.push("/orders");
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">Add some products and come back to check out.</p>
        <Link href="/">
          <Button className="mt-6">Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">Your cart</h1>
      <p className="mt-1 text-sm text-gray-500">{items.length} item(s) in your cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    No image
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-400 hover:text-red-600"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2 rounded-md border border-gray-200">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 text-gray-500 hover:text-gray-900"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 text-gray-500 hover:text-gray-900"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary / checkout */}
        <div>
          <Card>
            <CardContent>
              <CardTitle>Order summary</CardTitle>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-500">Free</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="font-medium text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>

              <form onSubmit={checkout} className="mt-6 space-y-3">
                <Field label="Street address" error={errors.street}>
                  <Input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    invalid={!!errors.street}
                    placeholder="123 Main St"
                  />
                </Field>
                <Field label="City" error={errors.city}>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    invalid={!!errors.city}
                    placeholder="New York"
                  />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    invalid={!!errors.phone}
                    placeholder="+1 555 000 1234"
                  />
                </Field>
                <Button type="submit" isLoading={pending} className="w-full" size="lg">
                  Place order
                </Button>
                {!user && (
                  <p className="text-center text-xs text-gray-500">
                    You&apos;ll be asked to log in if you aren&apos;t already.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
