"use client";

import {
  isQuoteTravelType,
  quoteTravelTypes,
  type QuoteTravelType,
} from "@/lib/quote-travel-types";

type TravelTypeCopy = {
  label: string;
  placeholder: string;
  otherPlaceholder: string;
  options: Record<QuoteTravelType, string>;
};

type TravelTypeFieldProps = {
  value: QuoteTravelType | "";
  detail: string;
  invalid?: boolean;
  detailInvalid?: boolean;
  className?: string;
  copy: TravelTypeCopy;
  onChange: (value: QuoteTravelType | "") => void;
  onDetailChange: (value: string) => void;
};

export function TravelTypeField({
  value,
  detail,
  invalid = false,
  detailInvalid = false,
  className = "",
  copy,
  onChange,
  onDetailChange,
}: TravelTypeFieldProps) {
  return (
    <div className={`grid gap-2 ${className}`}>
      <label className="grid gap-1.5">
        <span className="sr-only">{copy.label}</span>
        <select
          value={value}
          aria-label={copy.label}
          aria-invalid={invalid || undefined}
          onChange={(event) => {
            const next = event.target.value;
            onChange(isQuoteTravelType(next) ? next : "");
          }}
          className={`h-10 w-full appearance-none rounded-full border bg-white/95 bg-[length:0.9rem] bg-[right_0.9rem_center] bg-no-repeat px-3.5 pr-9 text-sm outline-none ${
            invalid ? "field-error-blink border-transparent" : "border-transparent"
          } ${value ? "text-neutral-900" : "text-neutral-400"}`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5 10 12.5 15 7.5' stroke='%236b7280' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
          }}
        >
          <option value="">{copy.placeholder}</option>
          {quoteTravelTypes.map((type) => (
            <option key={type} value={type}>
              {copy.options[type]}
            </option>
          ))}
        </select>
      </label>

      {value === "other" ? (
        <input
          value={detail}
          placeholder={copy.otherPlaceholder}
          aria-label={copy.options.other}
          aria-invalid={detailInvalid || undefined}
          onChange={(event) => onDetailChange(event.target.value)}
          className={`h-10 w-full rounded-full border bg-white/95 px-3.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 ${
            detailInvalid ? "field-error-blink border-transparent" : "border-transparent"
          }`}
        />
      ) : null}
    </div>
  );
}
