"use client";

import { Children, useEffect, useRef, type ReactNode } from "react";

type RevealListProps = {
  children: ReactNode;
  className?: string;
};

export function RevealList({ children, className = "" }: RevealListProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = [...root.querySelectorAll<HTMLElement>("[data-reveal-item]")];
    if (items.length === 0) return;

    const reveal = (item: HTMLElement) => {
      item.dataset.revealed = "true";
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const item of items) reveal(item);
      root.dataset.revealReady = "true";
      return;
    }

    for (const [index, item] of items.entries()) {
      item.style.setProperty("--reveal-delay", `${index * 90}ms`);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "40px 0px 0px 0px", threshold: 0.05 },
    );

    root.dataset.revealReady = "true";

    const frame = window.requestAnimationFrame(() => {
      for (const item of items) {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          reveal(item);
        } else {
          observer.observe(item);
        }
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [children]);

  return (
    <div ref={rootRef} className={className}>
      {Children.map(children, (child, index) => (
        <div key={index} data-reveal-item className="reveal-genie">
          {child}
        </div>
      ))}
    </div>
  );
}
