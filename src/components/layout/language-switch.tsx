"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { setLocale } from "@/actions/locale";
import { locales, type Locale } from "@/lib/i18n/locale";

export function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(code: Locale) {
    if (code === locale || pending) {
      setOpen(false);
      return;
    }
    const formData = new FormData();
    formData.set("locale", code);
    startTransition(async () => {
      await setLocale(formData);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={pending}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-chrome-control px-2.5 text-xs font-medium text-ivory hover:border-chrome-control-hover hover:text-chrome-hover-text disabled:opacity-60"
      >
        {locale.toUpperCase()}
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="popup-enter-panel absolute top-full right-0 z-50 mt-1.5 min-w-[4.5rem] overflow-hidden rounded-xl border border-chrome-control bg-chrome-menu py-1 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)]"
        >
          {locales.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => choose(code)}
                  className={`flex w-full items-center px-3 py-2 text-left text-xs font-medium transition disabled:opacity-60 ${
                    active
                      ? "bg-burgundy text-white"
                      : "text-ivory hover:bg-chrome-hover hover:text-chrome-hover-text"
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-2.5 w-2.5 text-ivory/70 transition ${open ? "rotate-180" : ""}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
