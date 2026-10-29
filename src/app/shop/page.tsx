"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, RotateCcw, Search, SlidersHorizontal, Sparkles } from "lucide-react";

import { ProductCard, ProductGridSkeleton } from "@/components/product-card";
import { useAsync } from "@/hooks/use-async";
import { getProducts } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { seedProducts } from "@/lib/seed-data";
import type { Gender } from "@/lib/types";

const MAX_PRICE = 100000;
const MIN_PRICE = 10000;
const initialProducts = seedProducts.filter((product) => product.status === "approved");
const genderTabs: { value: Gender | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
];

function parseGender(value: string | null): Gender | "all" {
  return value === "men" || value === "women" || value === "kids" ? value : "all";
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-24 text-center">Loading catalogue...</div>}>
      <ShopParamsWrapper />
    </Suspense>
  );
}

function ShopParamsWrapper() {
  const params = useSearchParams();
  const search = params.get("search") ?? "";
  const gender = parseGender(params.get("gender"));
  return <ShopContent key={`${search}:${gender}`} initialSearch={search} initialGender={gender} />;
}

function ShopContent({ initialSearch, initialGender }: { initialSearch: string; initialGender: Gender | "all" }) {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedGender, setSelectedGender] = useState<Gender | "all">(initialGender);
  const [sortBy, setSortBy] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  const { data, loading } = useAsync(() => getProducts(), [], initialProducts);
  const products = useMemo(() => data ?? [], [data]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const nextProducts = products.filter((product) => {
      const matchesGender = selectedGender === "all" || product.gender === selectedGender || product.gender === "unisex";
      const matchesPrice = product.price <= maxPrice;
      const matchesSearch =
        term.length === 0 ||
        [product.name, product.description, product.productType, product.material, product.sellerName, ...product.colors.map((color) => color.name)]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return matchesGender && matchesPrice && matchesSearch;
    });

    switch (sortBy) {
      case "low-to-high":
        return [...nextProducts].sort((a, b) => a.price - b.price);
      case "high-to-low":
        return [...nextProducts].sort((a, b) => b.price - a.price);
      case "newest":
        return [...nextProducts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      default:
        return [...nextProducts].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
  }, [products, maxPrice, searchTerm, selectedGender, sortBy]);

  const genderLabel = genderTabs.find((tab) => tab.value === selectedGender)?.label;
  const pageTitle = selectedGender === "all" ? "Shop all" : `Shop ${genderLabel}`;

  const handleReset = () => {
    setSelectedGender("all");
    setSearchTerm("");
    setSortBy("featured");
    setMaxPrice(MAX_PRICE);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[color:var(--brand-border)] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Now in: Kaftans</span>
          </div>
          <h1 className="font-display mt-2 text-4xl text-[color:var(--brand-deep)] sm:text-5xl">
            {pageTitle}
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-[color:var(--brand-charcoal)]/75">
            Clothing for everyone, from us and approved independent sellers. Our current collection: modern kaftans.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-[color:var(--brand-charcoal)]/60">
            Showing <strong className="text-[color:var(--brand-deep)] font-bold">{filteredProducts.length}</strong> products
          </span>
        </div>
      </div>

      <div className="mb-6 flex gap-1 rounded-full border border-[color:var(--brand-border)] bg-white p-1 w-fit">
        {genderTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setSelectedGender(tab.value)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition sm:px-5 ${
              selectedGender === tab.value
                ? "bg-[color:var(--brand-deep)] text-white"
                : "text-[color:var(--brand-charcoal)]/75 hover:bg-[color:var(--brand-soft)]/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Control Bar */}
      <div className="mb-8 rounded-3xl border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-4 sm:p-5 shadow-[0_12px_30px_rgba(91,64,50,0.04)]">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-[1.2fr_0.8fr_1fr] items-end">
          {/* Search Box */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">
              Search
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3.5 py-2.5 focus-within:border-[color:var(--brand-primary)]">
              <Search className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search kaftan, linen, black, seller..."
                className="w-full bg-transparent text-xs text-[color:var(--brand-charcoal)] placeholder:text-[color:var(--brand-charcoal)]/45 focus:outline-none"
              />
            </div>
          </div>

          {/* Sort Selection */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">
              Sort By
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-3.5 py-2.5">
              <SlidersHorizontal className="h-4 w-4 text-[color:var(--brand-chocolate)]/60" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-[color:var(--brand-charcoal)] focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Picks</option>
                <option value="newest">Newest Arrivals</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)]">
                Max Price Cap
              </label>
              <span className="text-xs font-bold text-[color:var(--brand-deep)]">
                {formatPrice(maxPrice)}
              </span>
            </div>
            <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] px-4 py-2 flex items-center">
              <input
                type="range"
                min={MIN_PRICE}
                max={MAX_PRICE}
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[color:var(--brand-primary)] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Active Filters row */}
        {(selectedGender !== "all" || searchTerm || maxPrice < MAX_PRICE || sortBy !== "featured") && (
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-[color:var(--brand-border)]/60">
            <span className="text-xs font-medium text-[color:var(--brand-charcoal)]/60 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Active Filters:
            </span>
            {selectedGender !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-soft)]/60 px-3 py-1 text-xs font-medium text-[color:var(--brand-deep)]">
                {genderLabel}
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-soft)]/60 px-3 py-1 text-xs font-medium text-[color:var(--brand-deep)]">
                &ldquo;{searchTerm}&rdquo;
              </span>
            )}
            {maxPrice < MAX_PRICE && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--brand-soft)]/60 px-3 py-1 text-xs font-medium text-[color:var(--brand-deep)]">
                Up to {formatPrice(maxPrice)}
              </span>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="ml-auto flex items-center gap-1 text-xs font-semibold text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)] transition"
            >
              <RotateCcw className="h-3 w-3" />
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading && products.length === 0 ? (
        <ProductGridSkeleton count={8} />
      ) : filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] border border-dashed border-[color:var(--brand-border)] bg-[color:var(--brand-white)] p-12 text-center">
          <h2 className="text-2xl font-bold text-[color:var(--brand-deep)]">No products match your filters</h2>
          <p className="mt-2 text-sm text-[color:var(--brand-charcoal)]/70 max-w-md mx-auto">
            Try adjusting your price ceiling, clearing your search query, or choosing another gender to see more.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Filters</span>
          </button>
        </div>
      )}

      <div className="mt-16 rounded-[30px] border border-[color:var(--brand-border)] bg-[color:var(--brand-soft)]/40 p-8 sm:p-10 shadow-[0_16px_40px_rgba(91,64,50,0.03)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-deep)]/75">
              For tailors &amp; boutiques
            </span>
            <h3 className="font-display mt-2 text-3xl text-[color:var(--brand-deep)] sm:text-4xl">
              Make or sell clothes? Sell them here.
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--brand-charcoal)]/75">
              Open a seller account, upload your pieces and get paid straight to your bank account after every sale.
            </p>
          </div>
          <Link
            href="/sell"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] shadow-sm hover:bg-[color:var(--brand-secondary)] transition"
          >
            Start selling
          </Link>
        </div>
      </div>
    </div>
  );
}
