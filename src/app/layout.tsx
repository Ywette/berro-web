import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SocialRail } from "@/components/layout/social-rail";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();

  return {
    title: {
      default: "Berro Travel",
      template: "%s · Berro Travel",
    },
    description: dictionary.meta.description,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="lv"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-night text-ivory">
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/staff" signUpFallbackRedirectUrl="/staff"
          appearance={{
            variables: { fontFamily: "var(--font-app)" },
            elements: { headerTitle: { fontFamily: "var(--font-heading)" } },
          }}>
          <Suspense fallback={<div className="min-h-full flex-1" />}>
            <LocalizedApp>{children}</LocalizedApp>
          </Suspense>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}

async function LocalizedApp({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <LocaleProvider locale={locale}>
      <div lang={locale} className="contents">
        <SiteHeader />
        <SocialRail />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </LocaleProvider>
  );
}
