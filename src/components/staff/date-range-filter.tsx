"use client";

export function DateRangeFilter({
  from,
  to,
  onChange,
  labels,
}: {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
  labels: {
    title: string;
    from: string;
    to: string;
    clear: string;
    invalid: string;
  };
}) {
  const invalid = Boolean(from && to && from > to);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <p className="w-full text-sm text-ivory">{labels.title}</p>
      <label className="text-xs text-mist">
        {labels.from}
        <input
          type="date"
          value={from}
          onChange={(event) => onChange({ from: event.target.value, to })}
          aria-invalid={invalid}
          className="mt-1 block rounded-lg border border-staff-control bg-night px-3 py-2 text-sm text-ivory [color-scheme:light]"
        />
      </label>
      <label className="text-xs text-mist">
        {labels.to}
        <input
          type="date"
          value={to}
          onChange={(event) => onChange({ from, to: event.target.value })}
          aria-invalid={invalid}
          className="mt-1 block rounded-lg border border-staff-control bg-night px-3 py-2 text-sm text-ivory [color-scheme:light]"
        />
      </label>
      {from || to ? (
        <button
          type="button"
          onClick={() => onChange({ from: "", to: "" })}
          className="rounded-full border border-staff-control px-3 py-2 text-xs text-ivory hover:border-staff-focus"
        >
          {labels.clear}
        </button>
      ) : null}
      {invalid ? (
        <p className="w-full text-xs text-staff-danger" role="alert">
          {labels.invalid}
        </p>
      ) : null}
    </div>
  );
}
