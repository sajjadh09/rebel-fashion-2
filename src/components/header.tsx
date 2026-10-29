
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Store,
  User,
  X,
} from "lucide-react";

import { useStore } from "@/components/store-provider";
import AnimatedLogo from "@/components/animated-logo";
import { SITE_NAME } from "@/lib/config";

/** Main navigation, in order. "Home" is first and "Admin" is always last. */
const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/sell", label: `Sell on ${SITE_NAME}` },
  { href: "/admin/login", label: "Admin" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/sell") return pathname === "/sell" || pathname.startsWith("/seller");
  if (href === "/admin/login") return pathname.startsWith("/admin");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, wishlist, openCart } = useStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    router.push(
      search.trim()
        ? `/shop?search=${encodeURIComponent(search.trim())}`
        : "/shop"
    );

    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--brand-border)] bg-[color:var(--brand-cream)]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-20 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-deep)] lg:hidden"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <Link href="/" className="min-w-0 shrink" aria-label="Store home">
              <AnimatedLogo className="max-w-[132px] sm:max-w-none" />
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} active={isActive(pathname, item.href)} />
            ))}
          </nav>

          <div className="hidden max-w-xs flex-1 justify-center md:flex">
            <form onSubmit={onSearch} className="w-full">
              <label className="sr-only" htmlFor="header-search">
                Search products
              </label>
              <div className="flex items-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white px-3.5 py-2">
                <Search className="h-4 w-4 shrink-0 text-[color:var(--brand-chocolate)]/60" />
                <input
                  id="header-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search the shop..."
                  className="w-full min-w-0 bg-transparent text-xs outline-none"
                />
              </div>
            </form>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <Link
              href="/account"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-deep)] sm:inline-flex"
              aria-label="Account"
            >
              <User className="h-4 w-4" />
            </Link>

            <Link
              href="/wishlist"
              className="relative hidden h-10 w-10 items-center sm:inline-flex justify-center rounded-full border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-deep)]"
              aria-label="Saved Items"
            >
              <Heart className="h-4 w-4" />
              {wishlist.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-1 text-[9px] font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              href="/seller/signup"
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[color:var(--brand-deep)] bg-[color:var(--brand-deep)] px-3 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-[color:var(--brand-chocolate)] sm:px-4"
            >
              <Store className="h-4 w-4 shrink-0" />
              <span className="sm:hidden">Sell</span>
              <span className="hidden sm:inline">Sell with us</span>
            </Link>

            <button
              type="button"
              onClick={openCart}
              aria-label="Open shopping bag"
              className="relative inline-flex h-10 items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-3.5 text-xs font-semibold text-[color:var(--brand-deep)]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Bag</span>
              {itemCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--brand-deep)] px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-[color:var(--brand-border)] py-4 lg:hidden">
            <form onSubmit={onSearch} className="mb-3">
              <label className="sr-only" htmlFor="mobile-search">
                Search products
              </label>
              <div className="flex items-center gap-2 rounded-full border border-[color:var(--brand-border)] bg-white px-3 py-2">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  id="mobile-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search the shop..."
                  className="w-full min-w-0 bg-transparent text-sm outline-none"
                />
              </div>
            </form>

            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-semibold uppercase tracking-wider"
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href="/seller/signup"
                onClick={() => setMenuOpen(false)}
                className="mt-1 flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white"
              >
                <Store className="h-4 w-4" /> Create seller account
              </Link>

              <div className="flex items-center justify-between border-t border-[color:var(--brand-border)] px-3 pt-3 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => {
                    openCart();
                    setMenuOpen(false);
                  }}
                >
                  Shopping Bag ({itemCount})
                </button>

                <Link
                  href="/wishlist"
                  onClick={() => setMenuOpen(false)}
                >
                  Wishlist ({wishlist.length})
                </Link>

                <Link href="/account" onClick={() => setMenuOpen(false)}>
                  Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
        active
          ? "bg-[color:var(--brand-primary)] text-[color:var(--brand-deep)]"
          : "text-[color:var(--brand-charcoal)]/80 hover:bg-[color:var(--brand-soft)]/60"
      }`}
    >
      {label}
    </Link>
  );
}
