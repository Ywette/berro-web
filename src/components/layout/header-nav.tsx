"use client";

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
