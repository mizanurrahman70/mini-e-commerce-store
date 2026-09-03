"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui/Input";
import { SORT_OPTIONS } from "@/lib/catalog";

export function ProductTools() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      // Changing the query or sort resets the page to the first one.
      if (key !== "page") params.delete("page");
      const qs = params.toString();
      router.replace(pathname + (qs ? `?${qs}` : ""));
    },
    [router, pathname, searchParams]
  );

  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "newest";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          value={q}
          placeholder="Search products…"
          onChange={(e) => setParam("q", e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={sort}
        onChange={(e) => setParam("sort", e.target.value)}
        className="sm:w-56"
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
