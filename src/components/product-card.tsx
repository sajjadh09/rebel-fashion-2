"use client";

import Link from "next/link";
import { Heart, Plus, Store } from "lucide-react";

import { SmartImage } from "@/components/smart-image";
import { useStore } from "@/components/store-provider";
import { PLATFORM_SELLER_ID } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  animationDelay,
}: {
  product: Product;
  animationDelay?: string;
}) {
  const { isWishlisted, toggleWishlist, addToCart } = useStore();
  const hoverImage = product.images[1] ?? product.colors[1]?.image;
  const isMarketplace = product.sellerId !== PLATFORM_SELLER_ID;

  const handleQuickAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    addToCart(
      {
        product,
        color: product.colors[0]?.name,
        size: product.sizes[0],
        quantity: 1,
      },
      false
    );
  };

  return (
    <article
      style={{ animationDelay }}
      className="group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-[26px] border border-[color:var(--brand-border)] bg-white shadow-[0_12px_35px_rgba(91,64,50,0.06)] motion-card-float"
    >
      <div className="relative">
        <Link
          href={`/product/${product.slug}`}
          className="block overflow-hidden rounded-t-[26px]"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-[color:var(--brand-ivory)]">
            <SmartImage
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover object-top transition duration-700 ease-out group-hover:scale-105 ${hoverImage ? "group-hover:opacity-0" : ""}`}
            />
            {hoverImage && (
              <SmartImage
                src={hoverImage}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-top opacity-0 transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,25,23,0.35)] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </Link>

        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-[color:var(--brand-deep)]/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
            {product.badge}
          </span>
        )}

        <button
          type="button"
          aria-label={
            isWishlisted(product.id)
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/90 text-[color:var(--brand-deep)] backdrop-blur-sm"
        >
          <Heart
            className={`h-4 w-4 ${
              isWishlisted(product.id) ? "fill-red-600 text-red-600" : ""
            }`}
          />
        </button>

        <div className="absolute inset-x-3 bottom-3 opacity-0 transition group-hover:opacity-100 max-sm:opacity-100">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-ivory)] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add to Bag
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            {product.colors.slice(0, 5).map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="h-3 w-3 rounded-full border border-black/15"
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[10px] font-semibold text-[color:var(--brand-charcoal)]/60">+{product.colors.length - 5}</span>
            )}
          </div>

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-[color:var(--brand-deep)] transition hover:text-[color:var(--brand-primary)]">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 flex items-center gap-1 truncate text-xs text-[color:var(--brand-charcoal)]/65">
            {isMarketplace && <Store className="h-3 w-3 shrink-0 text-[color:var(--brand-primary)]" />}
            <span className="truncate">Sold by {product.sellerName}</span>
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--brand-border)]/60 pt-3">
          <span className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[color:var(--brand-deep)]">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-[color:var(--brand-charcoal)]/45 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </span>

          <Link
            href={`/product/${product.slug}`}
            className="text-xs font-medium text-[color:var(--brand-deep)] hover:text-[color:var(--brand-primary)]"
          >
            Details →
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-[26px] border border-[color:var(--brand-border)] bg-white">
          <div className="aspect-[3/4] bg-[color:var(--brand-ivory)]" />
          <div className="space-y-2 p-5">
            <div className="h-3 w-2/3 rounded bg-[color:var(--brand-ivory)]" />
            <div className="h-3 w-1/3 rounded bg-[color:var(--brand-ivory)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
