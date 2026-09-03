"use client";


import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";

export function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
  disabled,
}: {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const toast = useToast();

  return (
    <Button
      size="lg"
      disabled={disabled}
      onClick={() => {
        addItem({ productId, name, price, imageUrl });
        toast.success(`${name} added to cart`);
      }}
    >
      <ShoppingCart className="h-5 w-5" />
      {disabled ? "Out of stock" : "Add to cart"}
    </Button>
  );
}
