"use client";

import { useState } from "react";
import { createProductAction, updateProductAction } from "@/lib/actions/products";
import { useToast } from "@/context/ToastContext";
import type { ProductWithId } from "@/lib/strapi/products";
import type { Category } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: ProductWithId | null;
  categories: Category[];
}

function ProductFormInner({
  product,
  categories,
  onSuccess,
  onClose,
}: Pick<Props, "product" | "categories" | "onSuccess" | "onClose">) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [categoryId, setCategoryId] = useState(
    String(product?.categories?.[0]?.id ?? "")
  );
  const [isActive, setIsActive] = useState(product ? product.isActive : true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    const priceNum = Number(price);
    if (!price || Number.isNaN(priceNum) || priceNum < 0) next.price = "Enter a valid price";
    const stockNum = Number(stock);
    if (stock === "" || Number.isNaN(stockNum) || stockNum < 0) next.stock = "Enter a valid stock";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      stock: stockNum,
      isActive,
      ...(categoryId ? { categories: [Number(categoryId)] } : {}),
    };

    setPending(true);
    const result = product
      ? await updateProductAction(product.id, payload)
      : await createProductAction(payload);
    setPending(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(product ? "Product updated" : "Product created");
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Name" error={errors.name}>
        <Input value={name} onChange={(e) => setName(e.target.value)} invalid={!!errors.name} />
      </Field>

      <Field label="Description">
        <Textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product description..."
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price (USD)" error={errors.price}>
          <Input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            invalid={!!errors.price}
            placeholder="0.00"
          />
        </Field>
        <Field label="Stock" error={errors.stock}>
          <Input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            invalid={!!errors.stock}
            placeholder="0"
          />
        </Field>
      </div>

      <Field label="Category">
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        Active (visible in store)
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" isLoading={pending}>
          {product ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}

export function ProductFormModal({ open, onClose, onSuccess, product, categories }: Props) {
  const key = open ? product?.id ?? "new" : "idle";
  return (
    <Modal open={open} onClose={onClose} title={product ? "Edit product" : "New product"}>
      {open && <ProductFormInner key={key} product={product} categories={categories} onSuccess={onSuccess} onClose={onClose} />}
    </Modal>
  );
}
