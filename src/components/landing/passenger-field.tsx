"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export type PassengerCounts = {
  adults: number;
  teens: number;
  children: number;
  infants: number;
};

export type PassengerFieldCopy = {
  label: string;
  adults: string;
  adultsAge: string;
  teens: string;
  teensAge: string;
  children: string;
  childrenAge: string;
  infant: string;
  infantAge: string;
  adultSingular: string;
  adultPlural: string;
  otherSingular: string;
  otherPlural: string;
  done: string;
  hint: string;
};

type PassengerFieldProps = {
  value: PassengerCounts;
  onChange: (value: PassengerCounts) => void;
  copy: PassengerFieldCopy;
  invalid?: boolean;
  maxTotal?: number;
  className?: string;
};

const emptyCounts = (): PassengerCounts => ({
  adults: 0,
  teens: 0,
  children: 0,
  infants: 0,
});

export function totalPassengers(counts: PassengerCounts) {
  return counts.adults + counts.teens + counts.children + counts.infants;
}

export function formatPassengerSummary(counts: PassengerCounts, copy: PassengerFieldCopy) {
  const other = counts.teens + counts.children + counts.infants;
  const parts: string[] = [];
  if (counts.adults > 0) {
    parts.push(
      `${counts.adults} ${counts.adults === 1 ? copy.adultSingular : copy.adultPlural}`,
    );
  }
  if (other > 0) {
    parts.push(`${other} ${other === 1 ? copy.otherSingular : copy.otherPlural}`);
  }
  return parts.join(", ");
}

type CategoryKey = keyof PassengerCounts;

export function PassengerField({
  value,
  onChange,
  copy,
  invalid = false,
  maxTotal = 49,
  className,
}: PassengerFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PassengerCounts>(value);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef(draft);
  const onChangeRef = useRef(onChange);
  const listId = useId();

  const adultLine =
    value.adults > 0
      ? `${value.adults} ${value.adults === 1 ? copy.adultSingular : copy.adultPlural}`
      : "";
  const otherCount = value.teens + value.children + value.infants;
  const otherLine =
    otherCount > 0
      ? `${otherCount} ${otherCount === 1 ? copy.otherSingular : copy.otherPlural}`
      : "";
  const hasSelection = Boolean(adultLine || otherLine);
  const draftTotal = totalPassengers(draft);
  const minors = draft.teens + draft.children + draft.infants;

  draftRef.current = draft;
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!open) setDraft(value);
  }, [open, value]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setCoords(null);
      setPortalRoot(null);
      return;
    }
    const dialog = rootRef.current.closest("dialog");
    const nextPortal = dialog ?? document.body;
    setPortalRoot(nextPortal);

    function updatePosition() {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(360, Math.max(280, rect.width));
      const popoverHeight = 420;
      const origin = dialog
        ? dialog.getBoundingClientRect()
        : ({ top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight } as DOMRect);
      const viewBottom = origin.bottom;
      const viewWidth = origin.right - origin.left;
      const spaceBelow = viewBottom - rect.bottom;
      const placeAbove = spaceBelow < popoverHeight && rect.top - origin.top > spaceBelow;
      const rawLeft = rect.left - origin.left;
      const left = Math.min(Math.max(8, rawLeft), Math.max(8, viewWidth - width - 8));
      const top = placeAbove
        ? Math.max(8, rect.top - origin.top - popoverHeight - 8)
        : rect.bottom - origin.top + 8;
      setCoords({ top, left, width });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  function commitAndClose(nextDraft = draftRef.current) {
    const total = totalPassengers(nextDraft);
    onChangeRef.current(total > 0 ? nextDraft : emptyCounts());
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      commitAndClose();
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

  function adjust(key: CategoryKey, delta: number) {
    setDraft((current) => {
      const next = { ...current, [key]: current[key] + delta };
      const nextMinors = next.teens + next.children + next.infants;
      if (next[key] < 0) return current;
      if (key === "adults" && next.adults < 1 && nextMinors > 0) return current;
      if (totalPassengers(next) > maxTotal) return current;
      return next;
    });
  }

  function openPicker() {
    if (totalPassengers(value) > 0) {
      // Fold legacy infant counts into children (0–9).
      setDraft({
        ...value,
        children: value.children + value.infants,
        infants: 0,
      });
    } else {
      setDraft({ adults: 1, teens: 0, children: 0, infants: 0 });
    }
    setOpen(true);
  }

  const categories: Array<{ key: CategoryKey; title: string; age: string }> = [
    { key: "adults", title: copy.adults, age: copy.adultsAge },
    { key: "teens", title: copy.teens, age: copy.teensAge },
    { key: "children", title: copy.children, age: copy.childrenAge },
  ];

  return (
    <div
      ref={rootRef}
      className={`relative overflow-visible ${invalid ? "z-40" : ""} ${className ?? ""}`}
    >
      <button
        type="button"
        aria-label={hasSelection ? formatPassengerSummary(value, copy) : copy.label}
        aria-invalid={invalid || undefined}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? commitAndClose() : openPicker())}
        className={`flex min-h-10 w-full items-center gap-1 rounded-full border bg-white/95 px-1.5 text-left outline-none sm:gap-2 sm:px-3 ${
          otherLine ? "h-10 py-1" : "h-10"
        } ${invalid ? "field-error-blink" : "border-transparent"}`}
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          className="block shrink-0 text-neutral-700"
          aria-hidden="true"
          fill="currentColor"
        >
          <circle cx="8" cy="7" r="3.5" />
          <circle cx="17" cy="8" r="3" />
          <path d="M8 12a7 7 0 0 0-7 7v1h14v-1a7 7 0 0 0-7-7Zm9 1c-.7 0-1.4.1-2 .4a9 9 0 0 1 2 5.6v1h6v-1a6 6 0 0 0-6-6Z" />
        </svg>
        <span className="flex min-w-0 flex-col">
          {adultLine && (
            <span className="truncate text-[12px] leading-tight text-neutral-900">
              {adultLine}
            </span>
          )}
          {otherLine && (
            <span className="truncate text-[11px] leading-tight text-neutral-600">
              {otherLine}
            </span>
          )}
          {!hasSelection && (
            <span className="truncate text-xs text-neutral-400 sm:text-sm">{copy.label}</span>
          )}
        </span>
      </button>

      {open && coords && portalRoot
        ? createPortal(
            <div
              ref={popoverRef}
              id={listId}
              role="dialog"
              aria-label={copy.label}
              style={{ top: coords.top, left: coords.left, width: coords.width }}
              className="popup-enter-panel fixed z-[10000] rounded-2xl border border-black/8 bg-white p-3 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)]"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex gap-2 rounded-xl bg-burgundy/8 px-3 py-2.5 text-[11px] leading-snug text-neutral-700">
                <InfoIcon />
                <p>{copy.hint}</p>
              </div>

              <ul className="space-y-1">
                {categories.map((category) => {
                  const count = draft[category.key];
                  const minAdults = category.key === "adults" && minors > 0 ? 1 : 0;
                  const canDecrease = count > minAdults;
                  const canIncrease = draftTotal < maxTotal;
                  return (
                    <li
                      key={category.key}
                      className="flex items-center justify-between gap-3 rounded-xl px-1 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900">{category.title}</p>
                        <p className="text-[11px] text-neutral-500">{category.age}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <button
                          type="button"
                          aria-label={`− ${category.title}`}
                          disabled={!canDecrease}
                          onClick={() => adjust(category.key, -1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition enabled:hover:border-burgundy enabled:hover:text-burgundy disabled:opacity-35"
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-sm font-semibold text-burgundy">
                          {count}
                        </span>
                        <button
                          type="button"
                          aria-label={`+ ${category.title}`}
                          disabled={!canIncrease}
                          onClick={() => adjust(category.key, 1)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-burgundy/35 bg-burgundy text-white transition enabled:hover:bg-burgundy-deep disabled:opacity-35"
                        >
                          +
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-2 flex justify-end border-t border-neutral-100 pt-2">
                <button
                  type="button"
                  onClick={() => commitAndClose()}
                  className="px-2 py-1.5 text-sm font-semibold text-burgundy hover:text-burgundy-deep"
                >
                  {copy.done}
                </button>
              </div>
            </div>,
            portalRoot,
          )
        : null}
    </div>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-burgundy" aria-hidden="true">
      <circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 9v4.5M10 6.4h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
