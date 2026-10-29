"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingBag, X } from "lucide-react";

import {
  imageForColor,
  initialSelection,
  missingSelection,
  ProductOptions,
  type ProductSelection,
} from "@/components/product-options";
import { SmartImage } from "@/components/smart-image";
import { useStore } from "@/components/store-provider";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * Quick-options sheet opened from a product card's "Choose options" button.
 * Bottom sheet on phones, centred dialog on larger screens.
 */
export function QuickAddSheet({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart } = useStore();
  const [selection, setSelection] = useState<ProductSelection>(() => initialSelection(product));
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const soldOut = product.stock <= 0;
  const image = imageForColor(product, selection.color);
  const colorHasOwnPhoto = Boolean(product.colors.find((c) => c.name === selection.color)?.image);

  const add = () => {
    const missing = missingSelection(product, selection);
    if (missing) {
      setError(missing);
      return;
    }
    addToCart({ product, type: selection.type, color: selection.color, size: selection.size, quantity }, false);
    onClose();
  };

  // Portal to <body>: product cards use transforms, which would trap a fixed overlay inside the card.
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby={`quick-${product.id}`}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

      <div className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:max-w-2xl sm:rounded-[28px]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close options"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[color:var(--brand-deep)] shadow"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="overflow-y-auto">
          <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
            <div className="relative aspect-[4/3] bg-[color:var(--brand-ivory)] sm:aspect-auto sm:min-h-[420px]">
              <SmartImage src={image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover object-center" />
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="pr-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">{product.productType}</p>
                <h2 id={`quick-${product.id}`} className="font-display mt-1 text-2xl text-[color:var(--brand-deep)]">
                  {product.name}
                </h2>
                <p className="mt-1 text-lg font-bold text-[color:var(--brand-deep)]">{formatPrice(product.price)}</p>
              </div>

              <ProductOptions product={product} value={selection} onChange={(next) => { setSelection(next); setError(""); }} idPrefix={`quick-${product.id}`} />
              {!colorHasOwnPhoto && selection.color && product.colors.length > 1 && (
                <p className="-mt-2 text-[11px] text-[color:var(--brand-charcoal)]/55">Photo shows {product.colors[0]?.name}; you&apos;ll receive {selection.color}.</p>
              )}

              <div className="flex items-center gap-3">
                <div className="flex h-12 items-center justify-between rounded-full border border-[color:var(--brand-border)] px-3 w-32">
                  <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-8 w-8 text-lg">−</button>
                  <span className="text-sm font-semibold">{quantity}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((q) => Math.min(10, q + 1))} className="h-8 w-8 text-lg">+</button>
                </div>
                <button
                  type="button"
                  onClick={add}
                  disabled={soldOut}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {soldOut ? "Sold out" : `Add to bag · ${formatPrice(product.price * quantity)}`}
                </button>
              </div>
              {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}

              <Link href={`/product/${product.slug}`} onClick={onClose} className="block text-center text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-deep)] underline-offset-4 hover:underline">
                View full details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
