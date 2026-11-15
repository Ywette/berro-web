import Image from "next/image";
import Link from "next/link";
import { HeaderNav, MobileMenu, StaffUserSwitch } from "@/components/layout/header-nav";
import { LanguageSwitch } from "@/components/layout/language-switch";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";

export async function SiteHeader() {
  const [dictionary, locale] = await Promise.all([getDictionary(), getLocale()]);
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
    { href: "/staff/employees", label: dictionary.staffDashboard.employees },
    { href: "/staff/calculation", label: dictionary.staffDashboard.calculation },
  ] as const;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-night/95 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link href="/" aria-label="Berro Travel" className="shrink-0">
          <Image
            src="/brand/berro-travel-logo.png"
            alt=""
            width={352}
            height={112}
            priority
            className="h-8 w-auto sm:h-9"
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
            <StaffUserSwitch label={dictionary.nav.staff} />
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
