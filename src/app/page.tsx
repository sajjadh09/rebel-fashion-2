import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Banknote, ShieldCheck, Truck } from "lucide-react";

import { Marquee } from "@/components/marquee";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { ProductRail } from "@/components/product-rail";
import RevealOnScroll from "@/components/reveal-on-scroll";
import { PLATFORM_COMMISSION_PERCENT, PLATFORM_SELLER_ID, SITE_NAME } from "@/lib/config";
import { HERO_IMAGES, kaftanStyles, seedProducts } from "@/lib/seed-data";

const approvedSeed = seedProducts.filter((product) => product.status === "approved");
const newestSeed = approvedSeed.filter((product) => product.sellerId !== PLATFORM_SELLER_ID).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export default function HomePage() {
  return (
    <>
      {/* ───── Hero ───── */}
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-[color:var(--brand-border)] bg-[color:var(--brand-white)] shadow-[0_28px_80px_rgba(91,64,50,0.08)]">
          <div className="grid items-stretch lg:grid-cols-[1fr_1fr]">
            <div className="relative z-10 flex flex-col justify-center p-6 sm:p-10 lg:p-14 xl:p-16">
              <span className="eyebrow">{SITE_NAME} · The Kaftan House</span>
              <h1 className="font-display mt-5 max-w-xl text-5xl leading-[0.95] text-[color:var(--brand-deep)] sm:text-6xl lg:text-7xl">
                Kaftans with <em className="text-[color:var(--brand-primary)]">presence</em>.
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-[color:var(--brand-charcoal)]/80 sm:text-base">
                Agbada, senator, jalabiya, abaya and Moroccan caftans — from our own atelier and Nigeria&apos;s best independent tailors, in one place.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand-deep)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[color:var(--brand-chocolate)]">
                  Shop kaftans
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/styles" className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--brand-deep)]/25 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-soft)]/50">
                  Browse by style
                </Link>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-[color:var(--brand-border)] pt-6">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-charcoal)]/55">Styles</dt>
                  <dd className="font-display mt-1 text-2xl text-[color:var(--brand-deep)]">{kaftanStyles.length}+</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-charcoal)]/55">For</dt>
                  <dd className="font-display mt-1 text-2xl text-[color:var(--brand-deep)]">Him · Her · Kids</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-charcoal)]/55">Delivery</dt>
                  <dd className="font-display mt-1 text-2xl text-[color:var(--brand-deep)]">36 + FCT</dd>
                </div>
              </dl>
            </div>

            <div className="relative grid min-h-[420px] grid-cols-[1.4fr_1fr] gap-2 bg-[color:var(--brand-ivory)] p-2 sm:min-h-[520px]">
              <div className="relative overflow-hidden rounded-[24px]">
                <Image src={HERO_IMAGES.main} alt="Man in an emerald aso-oke agbada" fill priority sizes="(max-width: 1024px) 60vw, 30vw" className="object-cover object-top transition-transform duration-700 hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,16,13,0.45)] via-transparent to-transparent" />
                <span className="font-display absolute bottom-4 left-4 text-xl italic text-white sm:text-2xl">The Agbada Edit</span>
              </div>
              <div className="grid grid-rows-2 gap-2">
                <div className="relative overflow-hidden rounded-[24px]">
                  <Image src={HERO_IMAGES.secondary} alt="Woman in an embroidered Moroccan takchita" fill sizes="(max-width: 1024px) 40vw, 20vw" className="object-cover object-top transition-transform duration-700 hover:scale-105" />
                </div>
                <div className="relative overflow-hidden rounded-[24px]">
                  <Image src={HERO_IMAGES.tertiary} alt="Man in a wine three-piece agbada" fill sizes="(max-width: 1024px) 40vw, 20vw" className="object-cover object-top transition-transform duration-700 hover:scale-105" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Marquee items={["Agbada", "Senator", "Jalabiya & Thobe", "Moroccan Caftan", "Abaya-Kaftan", "Embroidered", "Kids' Kaftans", "Made by Nigerian tailors"]} />

      {/* ───── Shop by style ───── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">Kaftans by style</span>
              <h2 className="font-display mt-2 text-4xl text-[color:var(--brand-deep)] sm:text-5xl">Find your silhouette</h2>
            </div>
            <Link href="/styles" className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:text-[color:var(--brand-primary)]">All styles →</Link>
          </div>
          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 sm:gap-4 lg:grid-cols-4">
            {kaftanStyles.map((style, index) => (
              <Link
                key={style.slug}
                href={`/shop?style=${style.slug}`}
                className={`group relative overflow-hidden rounded-[24px] bg-[color:var(--brand-ivory)] ${index === 0 ? "aspect-[3/4] lg:row-span-2 lg:aspect-auto" : "aspect-[3/4]"}`}
              >
                <Image src={style.image} alt={style.name} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,16,13,0.75)] via-[rgba(20,16,13,0.1)] to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <h3 className="font-display text-xl text-white sm:text-2xl">{style.name}</h3>
                  <p className="mt-1 line-clamp-2 hidden text-xs text-white/80 sm:block">{style.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      {/* ───── Featured ───── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow">Featured now</span>
              <h2 className="font-display mt-2 text-4xl text-[color:var(--brand-deep)] sm:text-5xl">The house edit</h2>
            </div>
            <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:text-[color:var(--brand-primary)]">View all →</Link>
          </div>
          <ProductRail initial={approvedSeed} limit={8} mode="featured" />
        </RevealOnScroll>
      </section>

      {/* ───── Him / Her / Kids ───── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "For Him", sub: "Agbada, senator & jalabiya", href: "/shop?gender=men", image: HERO_IMAGES.men },
            { label: "For Her", sub: "Abaya, Moroccan & embroidered", href: "/shop?gender=women", image: HERO_IMAGES.women },
            { label: "For Kids", sub: "Mini kaftans for big days", href: "/shop?gender=kids", image: HERO_IMAGES.kids },
          ].map((panel) => (
            <Link key={panel.label} href={panel.href} className="group relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[color:var(--brand-ivory)]">
              <Image src={panel.image} alt={panel.label} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,16,13,0.7)] via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                <div>
                  <h3 className="font-display text-3xl text-white">{panel.label}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/75">{panel.sub}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[color:var(--brand-deep)] transition group-hover:bg-[color:var(--brand-primary)]">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───── New from sellers ───── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <RevealOnScroll>
          <div className="mb-8">
            <span className="eyebrow">Just landed</span>
            <h2 className="font-display mt-2 text-4xl text-[color:var(--brand-deep)] sm:text-5xl">New from our sellers</h2>
            <p className="mt-2 max-w-xl text-sm text-[color:var(--brand-charcoal)]/70">Every listing is reviewed by our team before it goes live.</p>
          </div>
          <ProductRail initial={newestSeed} limit={4} mode="newest" marketplaceOnly />
        </RevealOnScroll>
      </section>

      {/* ───── Sell band ───── */}
      <section className="bg-[color:var(--brand-ink)] text-[color:var(--brand-soft)]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <span className="eyebrow">For tailors &amp; boutiques</span>
            <h2 className="font-display mt-4 text-4xl text-white sm:text-6xl">
              Sell on {SITE_NAME}.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-[color:var(--brand-soft)]/80 sm:text-base">
              List your kaftans, reach shoppers across Nigeria and get paid straight to your bank account. We only keep {PLATFORM_COMMISSION_PERCENT}% when you make a sale.
            </p>
            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {["Create your seller account", "Upload your pieces", "Get approved & paid"].map((step, index) => (
                <li key={step} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <span className="font-display text-3xl text-[color:var(--brand-primary)]">0{index + 1}</span>
                  <p className="mt-2 text-sm font-semibold text-white">{step}</p>
                </li>
              ))}
            </ol>
            <Link href="/sell" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] transition hover:bg-[color:var(--brand-secondary)]">
              Start selling <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
            <Image src={HERO_IMAGES.sell} alt="Tailor-made aso-oke agbada" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover object-top" />
          </div>
        </div>
      </section>

      {/* ───── Trust ───── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-6 lg:grid-cols-4">
          {[
            { icon: Truck, title: "Nationwide delivery", body: "All 36 states and the FCT" },
            { icon: ShieldCheck, title: "Secure payments", body: "Card & transfer via Paystack" },
            { icon: BadgeCheck, title: "Verified sellers", body: "Every listing is reviewed" },
            { icon: Banknote, title: "Fair to makers", body: "Sellers are paid directly" },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-cream)] text-[color:var(--brand-primary)]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[color:var(--brand-deep)]">{title}</p>
                <p className="text-xs text-[color:var(--brand-charcoal)]/65">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <NewsletterSignup />
    </>
  );
}
