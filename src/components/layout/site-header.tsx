import Image from "next/image";
import Link from "next/link";
import { setLocale } from "@/actions/locale";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";
import { HeaderNav, StaffUserSwitch } from "@/components/layout/header-nav";

export async function SiteHeader() {
  const [dictionary, locale] = await Promise.all([getDictionary(), getLocale()]);
  const publicLinks = [
    { href: "/#fleet", label: dictionary.nav.fleet },
    { href: "/#services", label: dictionary.nav.services },
    { href: "/excursions", label: dictionary.nav.excursions },
    { href: "/blog", label: dictionary.nav.blog },
    { href: "/#about", label: dictionary.nav.about },
    { href: "/contact", label: dictionary.nav.contact },
  ] as const;
  const staffLinks = [
    { href: "/staff/orders", label: dictionary.staffDashboard.orders },
    { href: "/staff/fleet", label: dictionary.staffDashboard.fleet },
    { href: "/staff/employees", label: dictionary.staffDashboard.employees },
  ] as const;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-night">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
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
        <div className="flex items-center gap-3 sm:gap-7">
          <div className="hidden items-center lg:flex">
            <HeaderNav publicLinks={publicLinks} staffLinks={staffLinks} />
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden lg:block">
              <LanguageSwitch locale={locale} label={dictionary.nav.language} />
            </div>
            <StaffUserSwitch label={dictionary.nav.staff} />
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 pb-3 text-sm text-ivory/75 lg:hidden">
        <LanguageSwitch locale={locale} label={dictionary.nav.language} />
        <HeaderNav
          publicLinks={publicLinks}
          staffLinks={staffLinks}
          variant="mobile"
        />
      </div>
    </header>
  );
}

function LanguageSwitch({ locale, label }: { locale: "lv" | "en"; label: string }) {
  return (
    <div className="flex items-center rounded-full border border-white/15 p-0.5 text-xs" aria-label={label}>
      <LocaleButton locale="lv" active={locale === "lv"} />
      <LocaleButton locale="en" active={locale === "en"} />
    </div>
  );
}

function LocaleButton({ locale, active }: { locale: "lv" | "en"; active: boolean }) {
  return (
    <form action={setLocale}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        aria-pressed={active}
        className={
          active
            ? "rounded-full bg-ivory px-2 py-1 font-medium text-night"
            : "rounded-full px-2 py-1 text-ivory/70 hover:text-white"
        }
      >
        {locale.toUpperCase()}
      </button>
    </form>
  );
}
