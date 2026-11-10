"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLinks } from "@/components/layout/nav-links";
import { StaffNav } from "@/components/staff/staff-nav";

type NavLink = { href: string; label: string };

export function isStaffPath(pathname: string) {
  return (
    pathname.startsWith("/staff") ||
    pathname.startsWith("/employees") ||
    pathname.startsWith("/drivers")
  );
}

export function HeaderNav({
  publicLinks,
  staffLinks,
  variant = "desktop",
}: {
  publicLinks: readonly NavLink[];
  staffLinks: readonly NavLink[];
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();

  if (isStaffPath(pathname)) {
    return <StaffNav links={staffLinks} />;
  }

  if (variant === "mobile") {
    return <NavLinks links={publicLinks} />;
  }

  return (
    <nav className="flex items-center gap-6 text-sm text-ivory/85" aria-label="Primary">
      <NavLinks links={publicLinks} />
    </nav>
  );
}

export function StaffUserSwitch({ label }: { label: string }) {
  const pathname = usePathname();
  const onStaff = isStaffPath(pathname);

  return (
    <Link
      href={onStaff ? "/" : "/staff"}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-full bg-ivory text-night hover:bg-white"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2" fill="currentColor" />
        <path
          d="M5.5 19.2c.8-3 3.2-4.6 6.5-4.6s5.7 1.6 6.5 4.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}

export function StaffModeGate({
  staff,
  public: publicContent,
}: {
  staff: React.ReactNode;
  public: React.ReactNode;
}) {
  const pathname = usePathname();
  return isStaffPath(pathname) ? staff : publicContent;
}
