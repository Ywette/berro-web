"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type StaffNavLink = {
  href: string;
  label: string;
};

export function StaffNav({ links }: { links: readonly StaffNavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Staff sections">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-full bg-ivory px-4 py-2 text-sm font-medium text-night"
                : "rounded-full border border-white/15 px-4 py-2 text-sm text-ivory/80 hover:border-white/40 hover:text-white"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
