import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Show } from "@clerk/nextjs";
import { AccountMenu, HeaderNav, MobileMenu } from "@/components/layout/header-nav";
import { LanguageSwitch } from "@/components/layout/language-switch";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";

export async function SiteHeader() {
  const [dictionary, locale] = await Promise.all([getDictionary(), getLocale()]);
  const signInLink = (
    <Link href="/sign-in" aria-label={dictionary.login.signIn} title={dictionary.login.signIn}
      className="grid h-9 w-9 place-items-center rounded-full border border-chrome-control text-ivory hover:border-chrome-control-hover focus-visible:outline-2 focus-visible:outline-offset-2">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="4.5" />
        <path d="m11.2 11.2 9 9m-3-3 2.5-2.5m-5 0 2-2" />
      </svg>
    </Link>
  );
  const publicLinks = [
    { href: "/excursions", label: dictionary.nav.excursions },
    { href: "/autoparks", label: dictionary.nav.fleet },
    { href: "/about", label: dictionary.nav.about },
    { href: "/blog", label: dictionary.nav.blog },
    { href: "/contact", label: dictionary.nav.contact },
  ] as const;
  const staffLinks = [
    { href: "/staff/calendar", label: dictionary.staffDashboard.calendar },
    { href: "/staff/orders", label: dictionary.staffDashboard.orders },
    { href: "/staff/fleet", label: dictionary.staffDashboard.fleet },
    { href: "/staff/excursions", label: dictionary.staffDashboard.excursionsNav },
    { href: "/staff/documents", label: dictionary.staffDashboard.documentsNav },
    { href: "/staff/employees", label: dictionary.staffDashboard.employees },
  ] as const;

  return (
    <header className="sticky top-0 z-30 border-b border-chrome-line bg-night/95 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link href="/" aria-label="Berro Travel" className="shrink-0">
          <Image
            src="/brand/berro-travel-logo-dark.png"
            alt=""
            width={352}
            height={112}
            priority
            className="site-brand-dark h-8 w-auto sm:h-9"
          />
          <Image
            src="/brand/berro-travel-logo-white.png"
            alt=""
            width={352}
            height={112}
            className="staff-brand-light h-8 w-auto sm:h-9"
          />
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden items-center lg:flex">
            <HeaderNav publicLinks={publicLinks} staffLinks={staffLinks} />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/#book"
              className="hidden rounded-full bg-burgundy px-3.5 py-1.5 text-xs font-medium text-white hover:bg-burgundy-deep sm:inline-flex"
            >
              {dictionary.nav.getOffer}
            </Link>
            <LanguageSwitch locale={locale} label={dictionary.nav.language} />
            <Suspense fallback={signInLink}>
              <Show when="signed-in" fallback={signInLink}>
                <Link href="/staff" className="whitespace-nowrap text-sm text-ivory hover:underline">
                  {dictionary.nav.staff}
                </Link>
                <AccountMenu staffLabel={dictionary.nav.staff} />
              </Show>
            </Suspense>
            <MobileMenu
              publicLinks={publicLinks}
              staffLinks={staffLinks}
              menuLabel={dictionary.nav.menu}
              closeLabel={dictionary.nav.closeMenu}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
