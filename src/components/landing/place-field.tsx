"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useDictionary } from "@/components/i18n/locale-provider";
import type { PlaceSuggestion } from "@/lib/places/types";

type PlaceFieldProps = {
  name: string;
  label: string;
  placeholder: string;
  inputClassName: string;
  className?: string;
  defaultText?: string;
  defaultPlaceId?: string;
};

export function PlaceField({
  name,
  label,
  placeholder,
  inputClassName,
  className = "",
  defaultText = "",
  defaultPlaceId = "",
}: PlaceFieldProps) {
  const dictionary = useDictionary();
  const inputId = useId();
  const listId = useId();
  const [text, setText] = useState(defaultText);
  const [placeId, setPlaceId] = useState(defaultPlaceId);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const latestRequest = useRef(0);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(debounce.current), []);

  useEffect(() => {
    setText(defaultText);
    setPlaceId(defaultPlaceId);
  }, [defaultText, defaultPlaceId]);

  async function load(query: string) {
    const requestId = ++latestRequest.current;
    const params = new URLSearchParams({ q: query, locale: dictionary.locale });
    const response = await fetch(`/api/places?${params.toString()}`);
    if (!response.ok || requestId !== latestRequest.current) return;
    const data = (await response.json()) as { suggestions: PlaceSuggestion[] };
    if (requestId !== latestRequest.current) return;
    setSuggestions(data.suggestions);
    setActive(-1);
    setOpen(data.suggestions.length > 0);
  }

  function onType(value: string) {
    setText(value);
    setPlaceId("");
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => void load(value), 200);
  }

  function choose(suggestion: PlaceSuggestion) {
    setText(suggestion.secondary ? `${suggestion.label}, ${suggestion.secondary}` : suggestion.label);
    setPlaceId(suggestion.id);
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        void load(text);
        return;
      }
      setActive((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && open) {
      event.preventDefault();
      setActive((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter" && open && active >= 0) {
      event.preventDefault();
      choose(suggestions[active]);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div className={`relative grid gap-1.5 text-xs text-ivory/70 ${className}`}>
      <label htmlFor={inputId}>{label}</label>
      <span className="relative">
        <Pin />
        <input
          id={inputId}
          name={name}
          required
          value={text}
          onChange={(event) => onType(event.target.value)}
          onFocus={() => {
            if (!placeId) void load(text);
          }}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          className={`${inputClassName} pl-9`}
        />
      </span>
      <input type="hidden" name={`${name}Place`} value={placeId} />
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute top-full right-0 left-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-md bg-white py-1 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)]"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(suggestion)}
              onMouseEnter={() => setActive(index)}
              className={`flex cursor-pointer items-baseline justify-between gap-3 px-3 py-2 ${
                index === active ? "bg-burgundy/10" : ""
              }`}
            >
              <span className="text-sm text-neutral-900">{suggestion.label}</span>
              <span className="shrink-0 text-xs text-neutral-500">{suggestion.secondary}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Pin() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 2.5a6.2 6.2 0 0 0-6.2 6.2c0 4.7 6.2 12.8 6.2 12.8s6.2-8.1 6.2-12.8A6.2 6.2 0 0 0 12 2.5Zm0 8.4a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Z"
      />
    </svg>
  );
}
