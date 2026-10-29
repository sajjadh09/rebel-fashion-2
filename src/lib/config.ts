/**
 * Global platform settings.
 *
 * Rename the brand, change the commission or tweak shipping prices here and
 * the whole frontend follows. Nothing in this file is secret: it ships to the
 * browser. Never put API keys or Paystack secret keys in this file.
 */

/** Brand name shown in the header, splash screen, footer and page titles. */
export const SITE_NAME = "Rebel Fashion";

/** Short line used under the brand name (splash screen, meta description). */
export const SITE_TAGLINE = "Fashion for everyone";

/**
 * Percentage the platform keeps from every marketplace sale.
 * Sellers receive (100 - PLATFORM_COMMISSION_PERCENT)% of each line.
 * The backend must use the same value as the Paystack subaccount
 * `percentage_charge` (see BACKEND.md).
 */
export const PLATFORM_COMMISSION_PERCENT = 10;

/** Seller id used for the platform's own (first-party) products, shown as "Sold by Rebel Fashion". */
export const PLATFORM_SELLER_ID = "platform";

/** Controlled list of apparel and fashion marketplace categories. */
export const CONTROLLED_CATEGORIES = [
  "Kaftans & Traditional",
  "Shirts & Tops",
  "Dresses & Skirts",
  "Trousers & Shorts",
  "Two-Piece Sets",
  "Shoes & Footwear",
  "Bags & Accessories",
] as const;

export type ControlledCategory = (typeof CONTROLLED_CATEGORIES)[number];

export function resolveProductCategory(product: { category?: string; productType?: string; name?: string }): ControlledCategory {
  if (product.category && CONTROLLED_CATEGORIES.includes(product.category as ControlledCategory)) {
    return product.category as ControlledCategory;
  }
  const text = `${product.productType ?? ""} ${product.name ?? ""}`.toLowerCase();
  if (/kaftan|jalabiya|thobe|abaya|caftan|djellaba|adire|agbada|senator/i.test(text)) {
    return "Kaftans & Traditional";
  }
  if (/shirt|polo|t-shirt|blouse|top/i.test(text)) {
    return "Shirts & Tops";
  }
  if (/dress|skirt/i.test(text)) {
    return "Dresses & Skirts";
  }
  if (/trouser|jean|short|pant/i.test(text)) {
    return "Trousers & Shorts";
  }
  if (/set|two-piece|suit/i.test(text)) {
    return "Two-Piece Sets";
  }
  if (/shoe|sneaker|sandal|slipper|footwear|boot/i.test(text)) {
    return "Shoes & Footwear";
  }
  if (/bag|cap|hat|belt|scarf|jewellery|watch|sunglasses|accessory/i.test(text)) {
    return "Bags & Accessories";
  }
  return "Kaftans & Traditional";
}

/** Shipping prices in Naira, used by checkout and the mock payment route. */
export const SHIPPING_RATES = {
  standard: 3500,
  priority: 6500,
} as const;

/** Currency used across the store. */
export const CURRENCY = "NGN";

/**
 * Data source switch: which implementation of src/lib/api/contract.ts runs.
 * - "mock"     -> demo store in the browser (localStorage). Default.
 * - "http"     -> REST backend at NEXT_PUBLIC_API_BASE_URL (src/lib/api/http.ts)
 * - "supabase" -> reserved for src/lib/api/supabase.ts (see "Connecting Supabase" in BACKEND.md)
 *
 * Set NEXT_PUBLIC_API_MODE. For backward compatibility, NEXT_PUBLIC_USE_MOCK_API="false"
 * (with no NEXT_PUBLIC_API_MODE) still means "http".
 */
export type ApiMode = "mock" | "http" | "supabase";

function resolveApiMode(): ApiMode {
  const mode = (process.env.NEXT_PUBLIC_API_MODE ?? "").trim().toLowerCase();
  if (mode === "mock" || mode === "http" || mode === "supabase") return mode;
  if (process.env.NEXT_PUBLIC_USE_MOCK_API === "false") return "http";
  return "mock";
}

export const API_MODE: ApiMode = resolveApiMode();

/** True when the browser-only demo store is active. */
export const USE_MOCK_API = API_MODE === "mock";

/** Base URL of the real backend, e.g. https://api.rebelfashion.ng/api/v1 */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

/**
 * Admin login used by the mock API only. Never shown anywhere in the UI.
 * Once a real backend is connected these values are ignored: the backend
 * checks admin credentials itself (Supabase: a profile with role "admin").
 */
export const ADMIN_DEMO_CREDENTIALS = {
  email: "admin@rebelfashion.demo",
  password: "RebelAdmin2026",
  name: "Platform Admin",
} as const;

/** Small artificial delay (ms) the mock API adds so loading states are visible. */
export const MOCK_API_DELAY_MS = 250;
