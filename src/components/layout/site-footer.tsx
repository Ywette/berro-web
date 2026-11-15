import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { StaffModeGate } from "@/components/layout/header-nav";

export async function SiteFooter() {
  const dictionary = await getDictionary();
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
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-mist">
          <StaffModeGate
            staff={staffLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
            public={publicLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          />
        </div>
      </div>
    </footer>
  );
}
