

export type SortKey = "newest" | "price_asc" | "price_desc" | "name_asc" | "name_desc";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
];


export function sortToStrapi(sort: string | undefined): string {
  switch (sort) {
    case "price_asc":
      return "price:asc";
    case "price_desc":
      return "price:desc";
    case "name_asc":
      return "name:asc";
    case "name_desc":
      return "name:desc";
    default:
      return "createdAt:desc";
  }
}

export type SearchParams = Record<string, string | string[] | undefined>;


export function readParam(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value?.trim() || undefined;
}


export function paginationLink(params: SearchParams, page: number): string {
  const usp = new URLSearchParams();
  const q = readParam(params, "q");
  const sort = readParam(params, "sort");
  if (q) usp.set("q", q);
  if (sort) usp.set("sort", sort);
  usp.set("page", String(page));
  const s = usp.toString();
  return s ? `?${s}` : "";
}
