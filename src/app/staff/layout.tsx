import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";
import { StaffThemeLayout } from "@/components/staff/staff-theme";
import { requireUser } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { STAFF_THEME_COOKIE } from "@/lib/staff/theme";

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="staff-theme mx-auto max-w-7xl px-5 py-12" data-theme="light" />}>
      <StaffShell>{children}</StaffShell>
    </Suspense>
  );
}

async function StaffShell({ children }: { children: ReactNode }) {
  const [, cookieStore, dictionary] = await Promise.all([requireUser(), cookies(), getDictionary()]);
  const initialTheme = cookieStore.get(STAFF_THEME_COOKIE)?.value === "dark" ? "dark" : "light";
  return (
    <StaffThemeLayout initialTheme={initialTheme} darkModeLabel={dictionary.staffDashboard.darkMode}>
      {children}
    </StaffThemeLayout>
  );
}
