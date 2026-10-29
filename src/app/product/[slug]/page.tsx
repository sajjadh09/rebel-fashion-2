import type { Metadata } from "next";

import { ProductPageClient } from "@/components/product-page-client";
import { SITE_NAME } from "@/lib/config";
import { findSeedProduct } from "@/lib/seed-data";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = findSeedProduct(slug);
  return {
    title: product ? `${product.name} | ${SITE_NAME}` : `Kaftan | ${SITE_NAME}`,
    description: product?.description,
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  // Demo catalogue items render immediately on the server; seller listings
  // (which only exist in the API) are loaded in the browser.
  const initialProduct = findSeedProduct(slug);
  return (
    <ProductPageClient
      slug={slug}
      initialProduct={initialProduct && initialProduct.status === "approved" ? initialProduct : null}
    />
  );
}
