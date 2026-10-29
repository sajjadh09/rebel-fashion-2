"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, ImagePlus, LoaderCircle, Plus, Trash2, X } from "lucide-react";

import { SmartImage } from "@/components/smart-image";
import { Card, ErrorNote, Field, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/ui/form";
import { useSellerSession } from "@/hooks/use-session";
import { createListing, uploadListingImage } from "@/lib/api";
import { PLATFORM_COMMISSION_PERCENT } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { kaftanStyles } from "@/lib/seed-data";
import type { ColorVariant, Gender, ProductCategory } from "@/lib/types";

const MAX_IMAGES = 6;

const categories: { value: ProductCategory; label: string }[] = [
  { value: "kaftan", label: "Kaftan" },
  { value: "agbada", label: "Agbada set" },
  { value: "abaya", label: "Abaya" },
  { value: "jalabiya", label: "Jalabiya / Thobe" },
  { value: "caps-accessories", label: "Caps & accessories" },
  { value: "other-clothing", label: "Other clothing" },
];

const sizePresets: Record<Gender, string[]> = {
  men: ["S", "M", "L", "XL", "XXL", "3XL"],
  women: ["XS", "S", "M", "L", "XL", "XXL", "Free size"],
  kids: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-12Y"],
  unisex: ["S", "M", "L", "XL", "XXL", "Free size"],
};

type ColorDraft = ColorVariant & { key: number };

export default function NewListingPage() {
  const router = useRouter();
  const { seller, loading } = useSellerSession();
  const fileInput = useRef<HTMLInputElement>(null);
  const keyCounter = useRef(1);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("kaftan");
  const [style, setStyle] = useState(kaftanStyles[0].slug);
  const [gender, setGender] = useState<Gender>("men");
  const [sizes, setSizes] = useState<string[]>(["M", "L", "XL"]);
  const [customSize, setCustomSize] = useState("");
  const [colors, setColors] = useState<ColorDraft[]>([{ key: 0, name: "", hex: "#7B1E2B" }]);
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [material, setMaterial] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const priceNumber = Number(price.replace(/[^\d]/g, ""));
  const commission = Math.round((priceNumber * PLATFORM_COMMISSION_PERCENT) / 100);

  async function handleImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      setError(`You can add up to ${MAX_IMAGES} photos.`);
      return;
    }
    setError("");
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files.slice(0, room)) {
        urls.push(await uploadListingImage(file));
      }
      setImages((current) => [...current, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add that photo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleColorImage(key: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadListingImage(file);
      setColors((current) => current.map((color) => (color.key === key ? { ...color, image: url } : color)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add that photo.");
    } finally {
      setUploading(false);
    }
  }

  function changeGender(value: Gender) {
    setGender(value);
    setSizes(sizePresets[value].slice(1, 4));
  }

  function toggleSize(size: string) {
    setSizes((current) => (current.includes(size) ? current.filter((s) => s !== size) : [...current, size]));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanColors = colors.filter((color) => color.name.trim());
    if (!name.trim()) return setError("Please add a title.");
    if (description.trim().length < 20) return setError("Please write a description of at least 20 characters (fabric, fit, occasion).");
    if (images.length === 0) return setError("Please add at least one photo.");
    if (!(priceNumber > 0)) return setError("Please enter a price in Naira.");
    if (sizes.length === 0) return setError("Choose at least one size.");
    if (cleanColors.length === 0) return setError("Add at least one colour with a name.");

    setSubmitting(true);
    try {
      await createListing({
        name,
        description,
        category,
        style,
        gender,
        sizes,
        colors: cleanColors.map(({ name: colorName, hex, image }) => ({ name: colorName.trim(), hex, ...(image ? { image } : {}) })),
        images,
        price: priceNumber,
        stock: Number(stock) || 0,
        material,
      });
      router.push("/seller/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your listing.");
      setSubmitting(false);
    }
  }

  if (loading || !seller) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-[color:var(--brand-primary)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/seller/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-charcoal)]/70 hover:text-[color:var(--brand-deep)]">
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>
      <h1 className="font-display mt-3 text-4xl text-[color:var(--brand-deep)] sm:text-5xl">New listing</h1>
      <p className="mt-2 text-sm text-[color:var(--brand-charcoal)]/70">
        Listings are reviewed by our team before they appear in the shop as &ldquo;Sold by {seller.businessName}&rdquo;.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
        <ErrorNote message={error} />

        <Card>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">Photos</h2>
          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/60">Up to {MAX_IMAGES} photos. The first one is the cover. Clear, well-lit front views get approved fastest.</p>
          <div className="mt-4 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-3 sm:grid-cols-6">
            {images.map((src, index) => (
              <div key={`${index}-${src.slice(-24)}`} className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[color:var(--brand-border)] bg-[color:var(--brand-ivory)]">
                <SmartImage src={src} alt={`Photo ${index + 1}`} fill sizes="120px" className="object-cover" />
                {index === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-[color:var(--brand-deep)] px-2 py-0.5 text-[9px] font-bold uppercase text-white">Cover</span>}
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] text-xs font-semibold text-[color:var(--brand-deep)] hover:border-[color:var(--brand-primary)]"
              >
                {uploading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                Add photos
              </button>
            )}
          </div>
          <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="title" className="sm:col-span-2">
              <input id="title" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Embroidered Senator Kaftan" maxLength={90} />
            </Field>
            <Field label="Description" htmlFor="description" className="sm:col-span-2" hint="Fabric, fit, occasion, what's included (cap, trousers…).">
              <textarea id="description" rows={4} className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <Field label="Category" htmlFor="category">
              <select id="category" className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)}>
                {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </Field>
            <Field label="Style" htmlFor="style">
              <select id="style" className={inputClass} value={style} onChange={(e) => setStyle(e.target.value)}>
                {kaftanStyles.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
              </select>
            </Field>
            <Field label="Gender" htmlFor="gender">
              <select id="gender" className={inputClass} value={gender} onChange={(e) => changeGender(e.target.value as Gender)}>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="unisex">Unisex</option>
              </select>
            </Field>
            <Field label="Fabric / material (optional)" htmlFor="material">
              <input id="material" className={inputClass} value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g. Cashmere senator" />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">Sizes</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {[...new Set([...sizePresets[gender], ...sizes])].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                aria-pressed={sizes.includes(size)}
                className={`h-10 min-w-12 rounded-xl px-3 text-xs font-bold transition ${
                  sizes.includes(size)
                    ? "bg-[color:var(--brand-deep)] text-white"
                    : "border border-[color:var(--brand-border)] bg-white text-[color:var(--brand-charcoal)] hover:border-[color:var(--brand-primary)]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="mt-3 flex max-w-xs gap-2">
            <input
              aria-label="Custom size"
              className={`${inputClass} mt-0`}
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              placeholder="Custom size, e.g. 4XL"
            />
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => {
                const value = customSize.trim();
                if (value && !sizes.includes(value)) setSizes((current) => [...current, value]);
                setCustomSize("");
              }}
            >
              Add
            </button>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">Colours</h2>
          <p className="mt-1 text-xs text-[color:var(--brand-charcoal)]/60">Add each colour you sell. A photo per colour is optional, but shoppers love it.</p>
          <div className="mt-4 space-y-3">
            {colors.map((color, index) => (
              <div key={color.key} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-cream)] p-3">
                <input
                  type="color"
                  aria-label={`Colour ${index + 1} swatch`}
                  value={color.hex}
                  onChange={(e) => setColors((current) => current.map((c) => (c.key === color.key ? { ...c, hex: e.target.value } : c)))}
                  className="h-11 w-11 shrink-0 cursor-pointer rounded-full border border-black/10 bg-transparent p-0.5"
                />
                <input
                  aria-label={`Colour ${index + 1} name`}
                  className={`${inputClass} mt-0 min-w-0 flex-1 bg-white`}
                  value={color.name}
                  onChange={(e) => setColors((current) => current.map((c) => (c.key === color.key ? { ...c, name: e.target.value } : c)))}
                  placeholder="Colour name, e.g. Royal Wine"
                />
                <label className="relative flex h-14 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-[color:var(--brand-border)] bg-white text-[color:var(--brand-charcoal)]/60" title="Photo for this colour (optional)">
                  {color.image ? (
                    <SmartImage src={color.image} alt={`${color.name || "Colour"} photo`} fill sizes="44px" className="object-cover" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => handleColorImage(color.key, e)} />
                </label>
                {colors.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove colour ${index + 1}`}
                    onClick={() => setColors((current) => current.filter((c) => c.key !== color.key))}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className={`${secondaryButtonClass} mt-3`}
            onClick={() => {
              const key = keyCounter.current++;
              setColors((current) => [...current, { key, name: "", hex: "#1D2840" }]);
            }}
          >
            <Plus className="h-4 w-4" /> Add colour
          </button>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[color:var(--brand-deep)]">Price &amp; stock</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (₦)" htmlFor="price">
              <input id="price" inputMode="numeric" className={inputClass} value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))} placeholder="45000" />
            </Field>
            <Field label="Stock (pieces available)" htmlFor="stock">
              <input id="stock" type="number" min={0} className={inputClass} value={stock} onChange={(e) => setStock(e.target.value)} />
            </Field>
          </div>
          {priceNumber > 0 && (
            <p className="mt-4 rounded-2xl bg-[color:var(--brand-cream)] px-4 py-3 text-xs text-[color:var(--brand-charcoal)]/80">
              For each sale at {formatPrice(priceNumber)} you receive <strong className="text-emerald-700">{formatPrice(priceNumber - commission)}</strong> (platform commission {PLATFORM_COMMISSION_PERCENT}%: {formatPrice(commission)}).
            </p>
          )}
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/seller/dashboard" className={secondaryButtonClass}>Cancel</Link>
          <button type="submit" disabled={submitting || uploading} className={primaryButtonClass}>
            {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Submit for review
          </button>
        </div>
      </form>
    </div>
  );
}
