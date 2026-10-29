"use client";

import { ProductCard, ProductGridSkeleton } from "@/components/product-card";
import { useAsync } from "@/hooks/use-async";
import { getProducts } from "@/lib/api";
import { PLATFORM_SELLER_ID } from "@/lib/config";
import type { Product, ProductFilters } from "@/lib/types";

/**
 * Grid of approved products from the API (platform kaftans + approved seller
 * listings). `initial` is rendered on the server so the page is never empty.
 */
export function ProductRail({
  filters = {},
  initial,
  limit = 8,
  mode = "featured",
  marketplaceOnly = false,
}: {
  filters?: ProductFilters;
  initial?: Product[];
  limit?: number;
  mode?: "featured" | "newest";
  marketplaceOnly?: boolean;
}) {
  const { data } = useAsync(() => getProducts(filters), [filters], initial);

  if (!data) return <ProductGridSkeleton count={4} />;

  const visible = marketplaceOnly ? data.filter((product) => product.sellerId !== PLATFORM_SELLER_ID) : data;
  const sorted = [...visible].sort((a, b) => {
    if (mode === "featured" && Boolean(b.featured) !== Boolean(a.featured)) return Number(b.featured) - Number(a.featured);
    return b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sorted.slice(0, limit).map((product, index) => (
        <ProductCard key={product.id} product={product} animationDelay={`${index * 70}ms`} />
      ))}
    </div>
  );
}
