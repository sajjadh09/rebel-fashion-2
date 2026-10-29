import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import AnimatedLogo from "@/components/animated-logo";
import { PLATFORM_COMMISSION_PERCENT, SITE_NAME } from "@/lib/config";
import { kaftanStyles } from "@/lib/seed-data";

const footerShopLinks = kaftanStyles.map((style) => ({
  href: `/shop?style=${style.slug}`,
  label: style.name,
}));

export function Footer() {
  return (
    <footer className="mt-24 border-t border-[color:var(--brand-border)] bg-[color:var(--brand-white)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1.1fr_1fr_1fr]">
          {/* Brand Intro & Locations */}
          <div className="space-y-4">
            <Link href="/" className="inline-block" aria-label="Store home">
              <AnimatedLogo className="min-w-[150px]" />
            </Link>

            <p className="max-w-sm text-xs leading-relaxed text-[color:var(--brand-charcoal)]/75">
              {SITE_NAME} is a kaftan marketplace: our own house kaftans alongside approved independent tailors and boutiques from across Nigeria.
            </p>

            <p className="text-xs text-[color:var(--brand-charcoal)]/70">Demo storefront: products, sellers and orders are sample data.</p>
          </div>

          {/* Curated Categories */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-deep)]">
              Kaftans by style
            </h3>
            <ul className="grid grid-cols-1 gap-2.5 text-xs text-[color:var(--brand-charcoal)]/75">
              {footerShopLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-[color:var(--brand-primary)] transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-deep)]">
              Client Concierge
            </h3>
            <ul className="space-y-2.5 text-xs text-[color:var(--brand-charcoal)]/75">
              <li>
                <Link href="/account" className="hover:text-[color:var(--brand-primary)] transition">
                  Order Tracking Coming Soon
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[color:var(--brand-primary)] transition">
                  My Wishlist Shortlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[color:var(--brand-primary)] transition">
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-[color:var(--brand-primary)] transition">
                  Sell on {SITE_NAME} ({PLATFORM_COMMISSION_PERCENT}% commission)
                </Link>
              </li>
              <li>
                <Link href="/seller/login" className="hover:text-[color:var(--brand-primary)] transition">
                  Seller login
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[color:var(--brand-primary)] transition">
                  Admin
                </Link>
              </li>
            </ul>
          </div>


          {/* Verified Guarantee & Payment methods */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-deep)]">
              Secure Checkout
            </h3>
            <div className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[color:var(--brand-deep)]">
                <ShieldCheck className="h-4 w-4 text-[color:var(--brand-primary)]" />
                <span>Secure Payment Gateway</span>
              </div>
              <p className="text-[11px] text-[color:var(--brand-charcoal)]/70 leading-relaxed">
                Payments are processed by Paystack. Sellers are paid directly to their bank accounts.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-semibold text-[color:var(--brand-deep)]">
                <span className="rounded bg-white px-2 py-0.5 border border-[color:var(--brand-border)]">Mastercard</span>
                <span className="rounded bg-white px-2 py-0.5 border border-[color:var(--brand-border)]">Visa</span>
                <span className="rounded bg-white px-2 py-0.5 border border-[color:var(--brand-border)]">Verve</span>
                <span className="rounded bg-white px-2 py-0.5 border border-[color:var(--brand-border)]">USSD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal / Copyright */}
        <div className="mt-14 flex flex-col gap-3 border-t border-[color:var(--brand-border)] pt-6 text-xs text-[color:var(--brand-charcoal)]/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {SITE_NAME}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>Encrypted ecommerce platform</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
