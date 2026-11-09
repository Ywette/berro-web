import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-night text-ivory">
        <Suspense fallback={<div className="min-h-full flex-1" />}>
          <LocalizedApp>{children}</LocalizedApp>
        </Suspense>
      </body>
    </html>
  );
}

async function LocalizedApp({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <LocaleProvider locale={locale}>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </LocaleProvider>
  );
}
