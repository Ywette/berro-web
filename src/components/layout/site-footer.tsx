import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function SiteFooter() {
  const dictionary = await getDictionary();

  return (
    <footer className="mt-auto border-t border-white/8 bg-panel">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Image
            src="/brand/berro-travel-logo.png"
            alt="Berro Travel"
            width={352}
            height={112}
            className="h-10 w-auto"
          />
          <p className="mt-2 text-sm text-mist">{dictionary.footer.tagline}</p>
        </div>
        <div className="flex gap-5 text-sm text-mist">
          <Link href="/#fleet" className="hover:text-white">
            {dictionary.nav.fleet}
          </Link>
          <Link href="/pricing" className="hover:text-white">
            {dictionary.nav.pricing}
          </Link>
          <Link href="/contact" className="hover:text-white">
            {dictionary.nav.contact}
          </Link>
          <Link href="/login" className="hover:text-white">
            {dictionary.nav.members}
          </Link>
        </div>
      </div>
    </footer>
  );
}
