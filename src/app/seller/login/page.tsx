"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { loginSeller } from "@/lib/api";
import { SITE_NAME, USE_MOCK_API } from "@/lib/config";

export default function SellerLoginPage() {
  const router = useRouter();

  return (
    <LoginForm
      eyebrow="Seller centre"
      title="Welcome back"
      subtitle={`Log in to manage your ${SITE_NAME} store.`}
      onLogin={async (email, password) => {
        await loginSeller(email, password);
        router.push("/seller/dashboard");
      }}
      footer={
        <>
          <p>
            New here? <Link href="/seller/signup" className="font-semibold text-[color:var(--brand-deep)] underline">Open a store</Link>
          </p>
          {USE_MOCK_API && (
            <p className="mt-3 text-xs text-[color:var(--brand-charcoal)]/55">
              Demo seller: arewa@rebelfashion.demo · Seller2026
            </p>
          )}
        </>
      }
    />
  );
}
