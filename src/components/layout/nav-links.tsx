"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

type NavLink = { href: string; label: string };

const homeSections = ["fleet", "services", "about"] as const;

function subscribeHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function getHash() {
  return window.location.hash.replace(/^#/, "");
}

export function NavLinks({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  const hash = useSyncExternalStore(subscribeHash, getHash, () => "");
  const [section, setSection] = useState("");

  useEffect(() => {
    if (pathname !== "/") return;

    const elements = homeSections
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: [0.15, 0.35, 0.55] },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [pathname]);

  const activeHomeSection = pathname === "/" ? section || hash : "";

  return links.map((link) => {
    const active = isActive(link.href, pathname, activeHomeSection);
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={active ? "font-medium text-burgundy" : "hover:text-white"}
      >
        {link.label}
      </Link>
    );
  });
}

function isActive(href: string, pathname: string, section: string) {
  if (href.startsWith("/#")) {
    return pathname === "/" && section === href.slice(2);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
