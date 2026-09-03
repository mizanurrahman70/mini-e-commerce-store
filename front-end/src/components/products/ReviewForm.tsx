"use client";

// Review submission form shown on the product detail page for logged-in
// customers. Submits through a server action (which attaches the httpOnly JWT
// server-side), with inline validation and a success toast.

import { useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { createReviewAction } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Input";

export function ReviewForm({ productId }: { productId: number }) {
  const { user } = useAuth();
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating (1–5 stars)");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a short review");
      return;
    }
    setError("");
    setPending(true);
    const result = await createReviewAction({
      product: productId,
      rating,
      comment: comment.trim(),
    });
    setPending(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Thanks for your review!");
      setRating(0);
      setComment("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-1">
        <span className="mr-2 text-sm text-gray-600">Your rating:</span>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            type="button"
            key={value}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(value)}
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-5 w-5 ${
                value <= (hover || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      <Field error={error}>
        <Textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
        />
      </Field>

      <Button type="submit" isLoading={pending}>
        Submit review
      </Button>
    </form>
  );
}
