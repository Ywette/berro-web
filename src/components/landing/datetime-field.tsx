"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type DateTimeInputProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  min?: string;
  invalid?: boolean;
  className?: string;
  placeholder?: string;
  suggestion?: { value: string; confirmLabel: string };
  "aria-label"?: string;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function parseValue(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: match[4],
    minute: match[5],
  };
}

function toValue(year: number, month: number, day: number, hour: string, minute: string) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${hour}:${minute}`;
}

export function formatDateTimeDisplay(value: string) {
  const parsed = parseValue(value);
  if (!parsed) return "";
  const day = String(parsed.day).padStart(2, "0");
  const month = String(parsed.month).padStart(2, "0");
  return `${day}-${month}-${parsed.year} ${parsed.hour}:${parsed.minute}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function startWeekday(year: number, month: number) {
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function parseMin(min?: string) {
  if (!min) return null;
  return parseValue(min.includes("T") ? min : `${min}T00:00`);
}

/** Combined date+time control: icon in front, picker closes after minute choice. */
export function DateTimeInput({
  value,
  onChange,
  name,
  min,
  invalid = false,
  className,
  placeholder = "—",
  suggestion,
  "aria-label": ariaLabel,
}: DateTimeInputProps) {
  const parsed = parseValue(value);
  const now = useMemo(() => new Date(), []);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.year ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.month ?? now.getMonth() + 1);
  const [draftDate, setDraftDate] = useState<{ year: number; month: number; day: number } | null>(
    parsed ? { year: parsed.year, month: parsed.month, day: parsed.day } : null,
  );
  const [draftHour, setDraftHour] = useState(parsed?.hour ?? "09");
  const [draftMinute, setDraftMinute] = useState(parsed?.minute ?? "");
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const minParsed = parseMin(min);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const next = parseValue(value);
    const minimum = parseMin(min);
    if (next) {
      setViewYear(next.year);
      setViewMonth(next.month);
      setDraftDate({ year: next.year, month: next.month, day: next.day });
      setDraftHour(next.hour);
      setDraftMinute(next.minute);
    } else if (minimum) {
      setViewYear(minimum.year);
      setViewMonth(minimum.month);
      setDraftDate({ year: minimum.year, month: minimum.month, day: minimum.day });
      setDraftHour(minimum.hour);
      setDraftMinute("");
    } else {
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth() + 1);
      setDraftDate(null);
      setDraftHour("09");
      setDraftMinute("");
    }
  }, [open, value, now, min]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setCoords(null);
      setPortalRoot(null);
      return;
    }
    // Modal <dialog> puts content in the top layer; body-portaled UI is inert there.
    const dialog = rootRef.current.closest("dialog");
    const nextPortal = dialog ?? document.body;
    setPortalRoot(nextPortal);
    function updatePosition() {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const narrow = window.innerWidth < 640;
      const width = narrow ? Math.min(320, window.innerWidth - 16) : 420;
      const popoverHeight = narrow ? 360 : 320;
      // Fixed inside <dialog> is relative to the dialog, not the viewport.
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
      setCoords({ top, left });
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
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

  function isDisabledDay(year: number, month: number, day: number) {
    if (!minParsed) return false;
    const stamp = year * 10_000 + month * 100 + day;
    const minStamp = minParsed.year * 10_000 + minParsed.month * 100 + minParsed.day;
    return stamp < minStamp;
  }

  function chooseDay(year: number, month: number, day: number) {
    if (isDisabledDay(year, month, day)) return;
    setDraftDate({ year, month, day });
  }

  function isDisabledTime(hour: string, minute: string) {
    if (!draftDate) return true;
    const candidate = toValue(draftDate.year, draftDate.month, draftDate.day, hour, minute);
    return Boolean(min && candidate < min);
  }

  function chooseMinute(minute: string) {
    if (!draftDate || isDisabledTime(draftHour, minute)) return;
    setDraftMinute(minute);
    onChange(toValue(draftDate.year, draftDate.month, draftDate.day, draftHour, minute));
    setOpen(false);
  }

  const blanks = startWeekday(viewYear, viewMonth);
  const totalDays = daysInMonth(viewYear, viewMonth);
  const display = formatDateTimeDisplay(value);
  const canConfirmSuggestion = suggestion && (!value || value < suggestion.value);

  return (
    <div ref={rootRef} className="relative min-w-0 w-full">
      {name ? <input type="hidden" name={name} value={value} /> : null}

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((current) => !current)}
          className={`flex h-9 w-full min-w-0 items-center gap-1.5 rounded-full border bg-white/95 px-2.5 text-left text-xs outline-none sm:h-10 sm:gap-2 sm:px-3.5 sm:text-sm ${
            invalid ? "field-error-blink" : "border-transparent"
          } ${display ? "text-neutral-900" : "text-neutral-400"} ${className ?? ""}`}
        >
          <CalendarGlyph />
          <span className={`min-w-0 flex-1 ${!display && canConfirmSuggestion ? "hero-time-suggestion leading-tight text-neutral-700" : "truncate"}`}>
            {display || placeholder}
          </span>
        </button>
        {canConfirmSuggestion && (
          <button
            type="button"
            aria-label={suggestion.confirmLabel}
            title={suggestion.confirmLabel}
            onClick={() => {
              onChange(suggestion.value);
              setOpen(false);
            }}
            className="grid size-7 shrink-0 place-items-center rounded-full border border-champagne/50 bg-night/80 text-champagne hover:bg-champagne hover:text-night"
          >
            <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
              <path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {open && coords && portalRoot
        ? createPortal(
            <div
              ref={popoverRef}
              id={listId}
              role="dialog"
              aria-label={ariaLabel}
              style={{ top: coords.top, left: coords.left }}
              className="popup-enter-panel fixed z-[10000] w-[min(100vw-1rem,20rem)] rounded-xl border border-white/15 bg-card p-2.5 shadow-2xl sm:w-[min(100vw-2rem,26.25rem)] sm:p-3"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
                    <button
                      type="button"
                      className="rounded-md px-2 py-1 text-sm text-ivory hover:bg-white/10"
                      onClick={() => {
                        if (viewMonth === 1) {
                          setViewMonth(12);
                          setViewYear((year) => year - 1);
                        } else {
                          setViewMonth((month) => month - 1);
                        }
                      }}
                    >
                      ‹
                    </button>
                    <p className="text-sm font-medium text-ivory">
                      {String(viewMonth).padStart(2, "0")}.{viewYear}
                    </p>
                    <button
                      type="button"
                      className="rounded-md px-2 py-1 text-sm text-ivory hover:bg-white/10"
                      onClick={() => {
                        if (viewMonth === 12) {
                          setViewMonth(1);
                          setViewYear((year) => year + 1);
                        } else {
                          setViewMonth((month) => month + 1);
                        }
                      }}
                    >
                      ›
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-mist sm:gap-1">
                    {WEEKDAYS.map((day) => (
                      <span key={day} className="py-1">
                        {day}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 grid grid-cols-7 gap-0.5 sm:gap-1">
                    {Array.from({ length: blanks }).map((_, index) => (
                      <span key={`blank-${index}`} />
                    ))}
                    {Array.from({ length: totalDays }, (_, index) => {
                      const day = index + 1;
                      const selected =
                        draftDate?.year === viewYear &&
                        draftDate?.month === viewMonth &&
                        draftDate?.day === day;
                      const disabled = isDisabledDay(viewYear, viewMonth, day);
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={disabled}
                          onClick={() => chooseDay(viewYear, viewMonth, day)}
                          className={`h-7 rounded-md text-[11px] transition sm:h-8 sm:text-xs ${
                            selected
                              ? "bg-burgundy text-white"
                              : disabled
                                ? "cursor-not-allowed text-mist/40"
                                : "text-ivory hover:bg-white/10"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex w-full shrink-0 flex-col border-t border-white/10 pt-2 sm:w-[7.25rem] sm:border-t-0 sm:border-l sm:pt-0 sm:pl-3">
                  <p className="mb-2 text-[11px] text-mist">
                    {draftDate
                      ? `${String(draftDate.day).padStart(2, "0")}-${String(draftDate.month).padStart(2, "0")}-${draftDate.year}`
                      : "—"}
                  </p>
                  <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
                    <div className="min-h-0">
                      <p className="mb-1 text-[10px] tracking-wide text-mist uppercase">HH</p>
                      <div className="max-h-[8.5rem] overflow-y-auto rounded-md border border-white/10 sm:max-h-[13.5rem]">
                        {HOURS.map((hour) => (
                          <button
                            key={hour}
                            type="button"
                            disabled={isDisabledTime(hour, "55")}
                            onClick={() => setDraftHour(hour)}
                            className={`block w-full px-1.5 py-1 text-center text-xs ${
                              draftHour === hour
                                ? "bg-burgundy text-white"
                                : "text-ivory hover:bg-white/10"
                            } disabled:cursor-not-allowed disabled:opacity-40`}
                          >
                            {hour}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="min-h-0">
                      <p className="mb-1 text-[10px] tracking-wide text-mist uppercase">MM</p>
                      <div className="max-h-[8.5rem] overflow-y-auto rounded-md border border-white/10 sm:max-h-[13.5rem]">
                        {MINUTES.map((minute) => (
                          <button
                            key={minute}
                            type="button"
                            disabled={isDisabledTime(draftHour, minute)}
                            onClick={() => chooseMinute(minute)}
                            className={`block w-full px-1.5 py-1 text-center text-xs ${
                              draftMinute === minute
                                ? "bg-burgundy text-white"
                                : "text-ivory hover:bg-white/10"
                            } disabled:cursor-not-allowed disabled:opacity-40`}
                          >
                            {minute}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            portalRoot,
          )
        : null}
    </div>
  );
}

type DateTimeFieldProps = DateTimeInputProps & {
  label: string;
  icon?: ReactNode;
  labelClassName?: string;
  hideLabel?: boolean;
};

export function DateTimeField({
  label,
  icon,
  labelClassName,
  hideLabel = false,
  invalid = false,
  className,
  placeholder,
  ...inputProps
}: DateTimeFieldProps) {
  return (
    <div
      className={`grid min-w-0 overflow-visible ${hideLabel ? "gap-0" : "gap-1.5"} ${invalid ? "relative z-40" : ""} ${labelClassName ?? (invalid ? "text-red-200" : "text-ivory/80")}`}
    >
      {hideLabel ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide">
          {icon}
          {label}
        </span>
      )}
      <DateTimeInput
        {...inputProps}
        invalid={invalid}
        placeholder={placeholder ?? (hideLabel ? label : "—")}
        aria-label={inputProps["aria-label"] ?? label}
        className={className ?? "h-9 rounded-full sm:h-10"}
      />
    </div>
  );
}

function CalendarGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      className="h-3.5 w-3.5 shrink-0 text-neutral-500 sm:h-4 sm:w-4"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 3.5V6.5M16 3.5V6.5M3.5 10h17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
