"use client";

// Product management table used by BOTH the vendor dashboard and admin panel.
//
// CRUD is gated by the usePermission hook (see lib/permissions.ts):
//   - "update:own" -> vendor (their own) / admin
//   - "delete"     -> admin only
// These checks are UX-only; Strapi enforces the real authorization.

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { usePermission } from "@/lib/permissions";
import { deleteProductAction } from "@/lib/actions/products";
import { formatPrice } from "@/lib/format";
import { productImage } from "@/lib/images";
import { nameToSlug } from "@/lib/strapi/products";
import type { ProductWithId } from "@/lib/strapi/products";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { Modal } from "@/components/ui/Modal";

interface Props {
  products: ProductWithId[];
  categories: Category[];
}

export function ProductManager({ products, categories }: Props) {
  const router = useRouter();
  const toast = useToast();

  const canCreate = usePermission("product", "create");
  const canUpdate = usePermission("product", "update:own");
  const canDelete = usePermission("product", "delete");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductWithId | null>(null);
  const [deleting, setDeleting] = useState<ProductWithId | null>(null);
  const [busy, setBusy] = useState(false);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(p: ProductWithId) {
    setEditing(p);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    const result = await deleteProductAction(deleting.id);
    setBusy(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Product deleted");
      setDeleting(null);
      router.refresh();
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{products.length} product(s)</p>
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New product
          </Button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          {canCreate ? "No products yet. Click 'New product' to add one." : "No products found."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Product</th>
                <th className="hidden px-4 py-3 sm:table-cell">Price</th>
                <th className="hidden px-4 py-3 md:table-cell">Stock</th>
                <th className="hidden px-4 py-3 md:table-cell">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/products/${nameToSlug(p.name)}`}
                      className="flex items-center gap-3"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        {productImage(p) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={productImage(p)}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300 text-xs">
                            —
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 hover:text-indigo-600">
                        {p.name}
                      </span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-gray-700 sm:table-cell">
                    {formatPrice(p.price)}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-gray-700 md:table-cell">
                    {p.stock}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <Badge tone={p.isActive ? "success" : "danger"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {canUpdate && (
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleting(p)}
                          className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => {
          setFormOpen(false);
          router.refresh();
        }}
        product={editing}
        categories={categories}
      />

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete product">
        <p className="text-sm text-gray-700">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{deleting?.name}</span>? This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} isLoading={busy}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
