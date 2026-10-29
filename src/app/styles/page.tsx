import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { SITE_NAME } from "@/lib/config";
import { kaftanStyles } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: `Kaftans by style | ${SITE_NAME}`,
};

const genderLabel = { men: "Men", women: "Women", kids: "Kids", unisex: "Men & Women" } as const;

export default function StylesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <span className="eyebrow">Kaftans by style</span>
        <h1 className="font-display mt-3 text-5xl text-[color:var(--brand-deep)] sm:text-6xl">Every silhouette, one house.</h1>
        <p className="mt-4 text-sm leading-relaxed text-[color:var(--brand-charcoal)]/75 sm:text-base">
          From the grand agbada to the everyday jalabiya — pick a style to see pieces from {SITE_NAME} and our approved sellers.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kaftanStyles.map((style, index) => (
          <Link
            key={style.slug}
            href={`/shop?style=${style.slug}`}
            className="group overflow-hidden rounded-[26px] border border-[color:var(--brand-border)] bg-white shadow-[0_12px_35px_rgba(91,64,50,0.05)]"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--brand-ivory)]">
              <Image src={style.image} alt={style.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              <span className="font-display absolute left-4 top-4 text-4xl text-white/90 drop-shadow">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">{genderLabel[style.gender]}</p>
              <h2 className="font-display mt-1 text-2xl text-[color:var(--brand-deep)]">{style.name}</h2>
              <p className="mt-2 text-xs leading-relaxed text-[color:var(--brand-charcoal)]/70">{style.description}</p>
              <span className="mt-4 inline-block text-xs font-bold uppercase tracking-wider text-[color:var(--brand-deep)] group-hover:text-[color:var(--brand-primary)]">Shop {style.name} →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
