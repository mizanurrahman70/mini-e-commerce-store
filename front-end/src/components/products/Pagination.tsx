

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SearchParams } from "@/lib/catalog";
import { paginationLink } from "@/lib/catalog";

function PageLink({
  href,
  active,
  disabled,
  children,
  ariaLabel,
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  if (disabled) {
    return (
      <span className="pointer-events-none inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-gray-200 px-2 text-sm text-gray-300">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm transition-colors ${
        active
          ? "border-indigo-600 bg-indigo-600 text-white"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </Link>
  );
}

export function Pagination({
  params,
  page,
  pageCount,
  total,
}: {
  params: SearchParams;
  page: number;
  pageCount: number;
  total: number;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav className="mt-10 flex flex-col items-center gap-3" aria-label="Pagination">
      <div className="flex items-center gap-1.5">
        <PageLink
          href={paginationLink(params, page - 1)}
          disabled={page <= 1}
          ariaLabel="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </PageLink>

        {pages.map((p) => (
          <PageLink
            key={p}
            href={paginationLink(params, p)}
            active={p === page}
            ariaLabel={`Page ${p}`}
          >
            {p}
          </PageLink>
        ))}

        <PageLink
          href={paginationLink(params, page + 1)}
          disabled={page >= pageCount}
          ariaLabel="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </PageLink>
      </div>
      <p className="text-sm text-gray-500">
        {total} product{total === 1 ? "" : "s"}
      </p>
    </nav>
  );
}
