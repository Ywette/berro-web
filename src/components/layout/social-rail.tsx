"use client";

import { usePathname } from "next/navigation";

const links = [
  {
    id: "facebook",
    href: "https://www.facebook.com/TravelBerro/",
    label: "Facebook",
    icon: FacebookIcon,
  },
  {
    id: "instagram",
    href: "https://www.instagram.com/berrotravel/",
    label: "Instagram",
    icon: InstagramIcon,
  },
  {
    id: "tiktok",
    href: "https://www.tiktok.com/@berrotravel",
    label: "TikTok",
    icon: TikTokIcon,
  },
  {
    id: "youtube",
    href: "https://www.youtube.com/channel/UCOl7ul6bxqiOPyQQikGnqvg",
    label: "YouTube",
    icon: YouTubeIcon,
  },
] as const;

export function SocialRail() {
  const pathname = usePathname();
  if (pathname.startsWith("/staff")) return null;

  return (
    <aside
      aria-label="Social media"
      className="pointer-events-none fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 sm:right-4 md:block"
    >
      <ul className="pointer-events-auto flex flex-col gap-2.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.id}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[rgba(18,18,20,0.82)] text-ivory shadow-[0_12px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-md transition hover:border-champagne/60 hover:bg-burgundy hover:text-white"
              >
                <Icon />
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M14.5 8.5V7.2c0-.7.5-1.2 1.2-1.2H17V3.5h-1.8c-2.2 0-3.7 1.5-3.7 3.8v1.2H9.5V11h2v9.5h3v-9.5h2.2l.3-2.5h-2.5Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M14.2 3.5c.5 2.4 2.1 4 4.5 4.4v2.5c-1.5-.1-2.9-.6-4.1-1.5v5.6c0 3.3-2.6 5.9-5.9 5.9S2.8 17.8 2.8 14.5 5.4 8.6 8.7 8.6c.4 0 .7 0 1.1.1v2.7c-.3-.1-.7-.2-1.1-.2-1.8 0-3.2 1.5-3.2 3.3s1.4 3.3 3.2 3.3 3.2-1.5 3.2-3.3V3.5h2.3Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M22.2 7.6a2.7 2.7 0 0 0-1.9-1.9C18.5 5.2 12 5.2 12 5.2s-6.5 0-8.3.5A2.7 2.7 0 0 0 1.8 7.6 28 28 0 0 0 1.3 12a28 28 0 0 0 .5 4.4 2.7 2.7 0 0 0 1.9 1.9c1.8.5 8.3.5 8.3.5s6.5 0 8.3-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22.7 12a28 28 0 0 0-.5-4.4ZM10 15.2V8.8l5.4 3.2L10 15.2Z" />
    </svg>
  );
}
