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
export const SITE_TAGLINE = "The Kaftan Marketplace";

/**
 * Percentage the platform keeps from every marketplace sale.
 * Sellers receive (100 - PLATFORM_COMMISSION_PERCENT)% of each line.
 * The backend must use the same value as the Paystack subaccount
 * `percentage_charge` (see BACKEND.md).
 */
export const PLATFORM_COMMISSION_PERCENT = 10;

/** Seller id used for the platform's own (first-party) kaftans. */
export const PLATFORM_SELLER_ID = "platform";

/** Shipping prices in Naira, used by checkout and the mock payment route. */
export const SHIPPING_RATES = {
  standard: 3500,
  priority: 6500,
} as const;

/** Currency used across the store. */
export const CURRENCY = "NGN";

/**
 * Data source switch.
 * - NEXT_PUBLIC_USE_MOCK_API not set or "true" -> demo data in the browser (localStorage)
 * - NEXT_PUBLIC_USE_MOCK_API="false"          -> real REST backend at NEXT_PUBLIC_API_BASE_URL
 */
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";

/** Base URL of the real backend, e.g. https://api.rebelfashion.ng/api/v1 */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

/**
 * DEMO ONLY admin login used by the mock API. It is intentionally not shown
 * on the login page. Once a real backend is connected these values are
 * ignored: the backend checks admin credentials itself.
 */
export const ADMIN_DEMO_CREDENTIALS = {
  email: "admin@rebelfashion.demo",
  password: "RebelAdmin2026",
  name: "Platform Admin",
} as const;

/** Small artificial delay (ms) the mock API adds so loading states are visible. */
export const MOCK_API_DELAY_MS = 250;
