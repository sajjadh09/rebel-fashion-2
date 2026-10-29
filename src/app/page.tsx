import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import RevealOnScroll from "@/components/reveal-on-scroll";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { ProductRail } from "@/components/product-rail";
import { KAFTAN_FEATURE_IMAGES, seedProducts } from "@/lib/seed-data";

// Rendered on the server so the page is never empty; the rails then refresh
// from the API (which also includes approved marketplace listings).
const catalogue = seedProducts.filter((product) => product.status === "approved");

const kaftanPanels = [
  { label: "For Him", sub: "Linen, thobes & jalabiyas", href: "/shop?gender=men", image: KAFTAN_FEATURE_IMAGES.men },
  { label: "For Her", sub: "Abaya, kimono & Moroccan-style", href: "/shop?gender=women", image: KAFTAN_FEATURE_IMAGES.women },
  { label: "For Kids", sub: "Little kaftans for big days", href: "/shop?gender=kids", image: KAFTAN_FEATURE_IMAGES.kids },
];

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10 lg:px-8 lg:pb-16">
        <div className="relative overflow-hidden rounded-[32px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] shadow-[0_28px_80px_rgba(91,64,50,0.08)] motion-float-slow">
          <div className="grid items-stretch lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative z-10 flex flex-col justify-center p-6 sm:p-10 lg:p-14 xl:p-16">
              <Link
                href="#now-in-kaftans"
                className="mb-4 inline-flex w-fit rounded-full border border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-primary)]/25"
              >
                New Season Edit · Now in: Kaftans
              </Link>
              <h1 className="max-w-xl text-4xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-5xl lg:text-6xl">
                Pieces worth remembering.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-[color:var(--brand-charcoal)]/80 sm:text-base">
                Discover thoughtfully selected fashion, accessories, and gifts designed for everyday moments and special occasions.
              </p>
              <Link href="/shop" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-secondary)] sm:w-fit">
                <span>Shop the collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative min-h-[300px] overflow-hidden bg-[color:var(--brand-ivory)] sm:min-h-[420px] lg:min-h-full">
              <Image src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80" alt="Curated fashion collection" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition-transform duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(28,25,23,0.42)] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Current collection */}
      <section id="now-in-kaftans" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">Now in</span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-4xl">Kaftans</h2>
              <p className="mt-2 max-w-xl text-sm text-[color:var(--brand-charcoal)]/75">
                Our current collection: modern kaftans in linen, cotton and crepe, from easy jalabiyas and thobes to abaya and kimono styles, for men, women and kids.
              </p>
            </div>
            <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:text-[color:var(--brand-primary)]">Shop kaftans →</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {kaftanPanels.map((panel) => (
              <Link key={panel.label} href={panel.href} className="group relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[color:var(--brand-ivory)]">
                <Image src={panel.image} alt={panel.label} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,16,13,0.65)] via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                  <div>
                    <h3 className="text-2xl font-extrabold text-white">{panel.label}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/80">{panel.sub}</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[color:var(--brand-deep)] transition group-hover:bg-[color:var(--brand-primary)]">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">Featured now</span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-[color:var(--brand-deep)] sm:text-4xl">Selected products</h2>
            </div>
            <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:text-[color:var(--brand-primary)]">View all →</Link>
          </div>
          <ProductRail initial={catalogue} limit={8} mode="featured" />
        </RevealOnScroll>
      </section>

      <NewsletterSignup />
    </>
  );
}
