import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { setLocale } from "@/actions/locale";
import { getOptionalUser } from "@/lib/auth/session";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";
import { SignOutButton } from "@/components/auth/sign-out-button";

export async function SiteHeader() {
  const [dictionary, locale] = await Promise.all([getDictionary(), getLocale()]);
  const links = [
    { href: "/#fleet", label: dictionary.nav.fleet },
    { href: "/#services", label: dictionary.nav.services },
    { href: "/#about", label: dictionary.nav.about },
    { href: "/contact", label: dictionary.nav.contact },
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
          <nav className="hidden items-center gap-6 text-sm text-ivory/85 lg:flex">
            <NavLinks links={links} />
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden lg:block">
              <LanguageSwitch locale={locale} label={dictionary.nav.language} />
            </div>
            <Link
              href="/login"
              className="rounded-full border border-white/25 px-3 py-2 text-sm text-ivory hover:border-white/60 sm:px-4"
            >
              {dictionary.nav.members}
            </Link>
            <Link
              href="/#book"
              className="rounded-full bg-burgundy px-3 py-2 text-sm font-medium text-white hover:bg-burgundy-deep sm:px-4"
            >
              {dictionary.nav.book}
            </Link>
            <Suspense fallback={null}>
              <AccountSlot staffLabel={dictionary.nav.staff} />
            </Suspense>
          </div>
        </div>
      </div>
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 pb-3 text-sm text-ivory/75 lg:hidden">
        <LanguageSwitch locale={locale} label={dictionary.nav.language} />
        <NavLinks links={links} />
      </nav>
    </header>
  );
}

function NavLinks({ links }: { links: readonly { href: string; label: string }[] }) {
  return links.map((link) => (
    <Link key={link.href} href={link.href} className="hover:text-white">
      {link.label}
    </Link>
  ));
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

async function AccountSlot({ staffLabel }: { staffLabel: string }) {
  const user = await getOptionalUser();

  if (!user) {
    return null;
  }

  return (
    <span className="flex items-center gap-2">
      <Link href="/employees" className="hidden text-sm text-mist hover:text-white sm:inline">
        {staffLabel}
      </Link>
      <SignOutButton />
    </span>
  );
}
