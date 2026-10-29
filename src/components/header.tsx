
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import { useStore } from "@/components/store-provider";
import AnimatedLogo from "@/components/animated-logo";
import { SITE_NAME } from "@/lib/config";
import { kaftanStyles } from "@/lib/seed-data";

const categoryItems = kaftanStyles.map((style) => ({
  href: `/shop?style=${style.slug}`,
  label: style.name,
}));

const navItems = [
  { href: "/shop", label: "Shop" },
  { href: `/sell`, label: `Sell on ${SITE_NAME}` },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, wishlist, openCart } = useStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
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

          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink href="/shop" label="Shop" active={pathname === "/shop"} />

            <div
              className="relative"
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCategoriesOpen((value) => !value)}
                onMouseEnter={() => setCategoriesOpen(true)}
                aria-expanded={categoriesOpen}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                  pathname === "/styles"
                    ? "bg-[color:var(--brand-primary)] text-[color:var(--brand-deep)]"
                    : "text-[color:var(--brand-charcoal)]/80 hover:bg-[color:var(--brand-soft)]/60"
                }`}
              >
                Kaftans by style
                <ChevronDown
                  className={`h-3.5 w-3.5 transition ${
                    categoriesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {categoriesOpen && (
                <div className="absolute left-0 top-full z-50 w-64 pt-2">
                  <div className="rounded-2xl border border-[color:var(--brand-border)] bg-white p-2 shadow-xl">
                    {categoryItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setCategoriesOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-xs font-semibold text-[color:var(--brand-charcoal)] hover:bg-[color:var(--brand-soft)]/50"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Link
                      href="/styles"
                      onClick={() => setCategoriesOpen(false)}
                      className="mt-1 block rounded-xl border-t border-[color:var(--brand-border)] px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] hover:bg-[color:var(--brand-soft)]/50"
                    >
                      View all styles →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/sell" label={`Sell on ${SITE_NAME}`} active={pathname === "/sell" || pathname.startsWith("/seller")} />
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
                  placeholder="Search kaftans..."
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
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-deep)]"
              aria-label="Saved Items"
            >
              <Heart className="h-4 w-4" />
              {wishlist.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--brand-primary)] px-1 text-[9px] font-bold">
                  {wishlist.length}
                </span>
              )}
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
                  placeholder="Search kaftans..."
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

              <div className="border-t border-[color:var(--brand-border)] pt-2">
                <Link
                  href="/styles"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-primary)]"
                >
                  Kaftans by style
                </Link>

                {categoryItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

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
