"use client";

import { useState, type ReactNode } from "react";
import { STAFF_THEME_COOKIE, type StaffTheme } from "@/lib/staff/theme";

export function StaffThemeLayout({
  children,
  initialTheme,
  darkModeLabel,
}: {
  children: ReactNode;
  initialTheme: StaffTheme;
  darkModeLabel: string;
}) {
  const [theme, setTheme] = useState(initialTheme);
  const dark = theme === "dark";

  function toggleTheme() {
    const nextTheme = dark ? "light" : "dark";
    setTheme(nextTheme);
    document.cookie = `${STAFF_THEME_COOKIE}=${nextTheme}; Path=/staff; Max-Age=31536000; SameSite=Lax`;
  }

  return (
    <div className="staff-theme" data-theme={theme}>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:py-12">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            role="switch"
            aria-label={darkModeLabel}
            aria-checked={dark}
            title={darkModeLabel}
            onClick={toggleTheme}
            className="relative grid h-11 w-20 cursor-pointer grid-cols-2 place-items-center rounded-full border border-staff-control bg-staff-subtle p-1 text-mist transition-colors hover:bg-staff-hover motion-reduce:transition-none"
          >
            <span
              aria-hidden="true"
              className={`absolute top-1/2 left-1.5 size-8 -translate-y-1/2 rounded-full bg-burgundy shadow-sm transition-transform duration-200 motion-reduce:transition-none ${dark ? "translate-x-[2.125rem]" : ""}`}
            />
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.7" strokeLinecap="round"
              className={`relative size-4.5 ${dark ? "" : "text-staff-on-accent"}`}>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4" />
            </svg>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
              className={`relative size-4.5 ${dark ? "text-staff-on-accent" : ""}`}>
              <path d="M20.7 14.8A8.8 8.8 0 0 1 9.2 3.3a9 9 0 1 0 11.5 11.5Z" />
            </svg>
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
