export type CalendarMonthValue = { year: number; month: number };

export function calendarDate({ year, month }: CalendarMonthValue, day: number) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function CalendarMonth({
  view,
  onViewChange,
  onDaySelect,
  selected,
  rangeEnd,
  markedDates,
  isDayDisabled,
  locale = "en",
}: {
  view: CalendarMonthValue;
  onViewChange: (view: CalendarMonthValue) => void;
  onDaySelect: (day: number) => void;
  selected?: string;
  rangeEnd?: string;
  markedDates?: ReadonlySet<string>;
  isDayDisabled?: (day: number) => boolean;
  locale?: string;
}) {
  const { year, month } = view;
  const blanks = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const totalDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const dayFormat = new Intl.DateTimeFormat(locale, { dateStyle: "full", timeZone: "UTC" });
  const monthFormat = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    weekdayFormat.format(new Date(Date.UTC(2024, 0, index + 1))),
  );

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
        {[-1, 0, 1].map((offset) => {
          if (offset === 0) {
            return <p key={offset} className="text-sm font-medium text-ivory">{String(month).padStart(2, "0")}.{year}</p>;
          }
          const adjacent = new Date(Date.UTC(year, month - 1 + offset, 1));
          return (
            <button
              key={offset}
              type="button"
              aria-label={monthFormat.format(adjacent)}
              className="rounded-md px-2 py-1 text-sm text-ivory hover:bg-chrome-hover"
              onClick={() => onViewChange({ year: adjacent.getUTCFullYear(), month: adjacent.getUTCMonth() + 1 })}
            >
              {offset < 0 ? "‹" : "›"}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-mist sm:gap-1">
        {weekdays.map((day, index) => <span key={index} className="py-1">{day}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-0.5 sm:gap-1">
        {Array.from({ length: blanks }, (_, index) => <span key={`blank-${index}`} />)}
        {Array.from({ length: totalDays }, (_, index) => {
          const day = index + 1;
          const date = calendarDate(view, day);
          const endpoint = date === selected || date === rangeEnd;
          const inRange = Boolean(selected && rangeEnd && date > selected && date < rangeEnd);
          const disabled = isDayDisabled?.(day);
          const color = endpoint ? "bg-burgundy text-white"
            : disabled ? "cursor-not-allowed text-mist/40"
              : inRange ? "bg-burgundy/25 text-ivory hover:bg-burgundy/40"
                : "text-ivory hover:bg-chrome-hover";

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              aria-label={dayFormat.format(new Date(Date.UTC(year, month - 1, day)))}
              aria-pressed={endpoint || inRange}
              onClick={() => onDaySelect(day)}
              className={`h-7 rounded-md text-[11px] transition sm:h-8 sm:text-xs ${color} ${markedDates?.has(date) ? "font-semibold underline underline-offset-2" : ""}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
