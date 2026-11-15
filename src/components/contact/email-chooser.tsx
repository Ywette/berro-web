"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";

type EmailChooserProps = {
  email: string;
  label: string;
};

export function EmailChooser({ email, label }: EmailChooserProps) {
  const dictionary = useDictionary();
  const { emailChooser } = dictionary.contact;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const encoded = encodeURIComponent(email);
  const options = [
    {
      id: "gmail",
      label: emailChooser.gmail,
      href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encoded}`,
      external: true,
    },
    {
      id: "outlook",
      label: emailChooser.outlook,
      href: `https://outlook.live.com/mail/0/deeplink/compose?to=${encoded}`,
      external: true,
    },
    {
      id: "yahoo",
      label: emailChooser.yahoo,
      href: `https://compose.mail.yahoo.com/?to=${encoded}`,
      external: true,
    },
    {
      id: "default",
      label: emailChooser.defaultApp,
      href: `mailto:${email}`,
      external: false,
    },
  ] as const;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-ivory transition hover:border-white/25 hover:bg-white/8"
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-burgundy/20 text-champagne">
          <EmailIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] tracking-wide text-mist uppercase">{label}</span>
          <span className="mt-0.5 block text-sm font-medium">{email}</span>
        </span>
        <span
          className={`shrink-0 text-mist transition ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <ChevronIcon />
        </span>
      </button>

      {open ? (
        <div
          id={listId}
          role="menu"
          aria-label={emailChooser.openWith}
          className="absolute top-[calc(100%+0.5rem)] left-0 z-20 w-full overflow-hidden rounded-xl border border-white/12 bg-[#1a1a1f] shadow-[0_16px_40px_rgba(0,0,0,0.45)]"
        >
          <p className="border-b border-white/8 px-4 py-2.5 text-[11px] tracking-wide text-mist uppercase">
            {emailChooser.openWith}
          </p>
          <ul className="py-1">
            {options.map((option) => (
              <li key={option.id}>
                <a
                  role="menuitem"
                  href={option.href}
                  target={option.external ? "_blank" : undefined}
                  rel={option.external ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  className="flex items-center px-4 py-2.5 text-sm text-ivory transition hover:bg-white/8"
                >
                  {option.label}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  void copyEmail();
                }}
                className="flex w-full items-center px-4 py-2.5 text-left text-sm text-ivory transition hover:bg-white/8"
              >
                {copied ? emailChooser.copied : emailChooser.copy}
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="m5 7.5 7 5.5 7-5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M5 7.5 10 12.5 15 7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
