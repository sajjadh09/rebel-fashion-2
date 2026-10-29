import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";

import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SplashIntro } from "@/components/splash-intro";
import { SPLASH_SESSION_KEY } from "@/lib/splash";
import { StoreProvider } from "@/components/store-provider";
import RouteTransitions from "@/components/route-transitions";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/config";

import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: `Shop agbada, senator, jalabiya, abaya and Moroccan kaftans from ${SITE_NAME} and approved independent sellers across Nigeria.`,
};

// Runs before first paint: on the homepage, covers the page until the intro
// splash mounts (once per session) so the homepage never flashes first.
const splashBootScript = `(function(){try{if(location.pathname==="/"&&sessionStorage.getItem(${JSON.stringify(
  SPLASH_SESSION_KEY
)})!=="1"){document.documentElement.setAttribute("data-splash-boot","1");}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={playfair.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashBootScript }} />
      </head>
      <body className="bg-[color:var(--brand-background)] text-[color:var(--brand-charcoal)]">
        <StoreProvider>
          <SplashIntro />
          <Header />
          <CartDrawer />
          <main>
            <RouteTransitions>{children}</RouteTransitions>
          </main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
