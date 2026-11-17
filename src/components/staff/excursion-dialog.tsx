"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { saveManagedExcursion, type ExcursionActionState } from "@/actions/excursions";
import {
  ExcursionCollagePhotos,
  type ExcursionCollagePhotoLabels,
} from "@/components/staff/excursion-collage-photos";
import type { FleetPhotoDraft } from "@/components/staff/fleet-photo-manager";
import { excursionRegions, type ExcursionRegion } from "@/lib/content/excursions";
import {
  EXCURSION_COLLAGE_PHOTO_COUNT,
  type ExcursionLogoVariant,
  type ManagedExcursion,
} from "@/lib/content/managed-excursion";
import { locales, type Locale, type Localized } from "@/lib/i18n/locale";
import { localeFieldLabels } from "@/lib/i18n/localized-content";

export type ExcursionDialogLabels = {
  addTitle: string;
  editTitle: string;
  close: string;
  save: string;
  saving: string;
  title: string;
  route: string;
  routeHint: string;
  teaser: string;
  teaserHint: string;
  details: string;
  detailsHint: string;
  price: string;
  priceHint: string;
  duration: string;
  durationHint: string;
  region: string;
  regionHint: string;
  regionLatvia: string;
  regionEstonia: string;
  regionLithuania: string;
  regionFrance: string;
  regionBelgium: string;
  regionBaltics: string;
  regionGermany: string;
} & ExcursionCollagePhotoLabels;

type ExcursionDialogProps = {
  excursion: ManagedExcursion | null;
  mode: "add" | "edit";
  labels: ExcursionDialogLabels;
  onClose: () => void;
};

const initialState: ExcursionActionState = {};

function photosFromExcursion(excursion: ManagedExcursion | null): FleetPhotoDraft[] {
  if (!excursion?.images.length) return [];
  return excursion.images.map((src, index) => ({
    id: `existing-${index}-${src}`,
    preview: src,
    src,
  }));
}

/** Exact locale value for editing (no cross-locale fallback). */
function fieldLocaleValue(value: Localized | string | null | undefined, locale: Locale): string {
  if (value == null) return "";
  if (typeof value === "string") return locale === "lv" ? value : "";
  const text = value[locale];
  return typeof text === "string" ? text : "";
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory/80">
      {label}
      {children}
      {hint ? <span className="text-[11px] font-normal text-mist">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white px-3 text-sm text-neutral-900 outline-none";

const textareaClass =
  "w-full resize-y rounded-lg border border-white/10 bg-white px-3 py-2 text-sm text-neutral-900 outline-none";

export function ExcursionDialog({ excursion, mode, labels, onClose }: ExcursionDialogProps) {
  const [photos, setPhotos] = useState<FleetPhotoDraft[]>(() => photosFromExcursion(excursion));
  const logoVariant: ExcursionLogoVariant = excursion?.logoVariant ?? "dark";
  const [state, formAction, pending] = useActionState(saveManagedExcursion, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [contentLocale, setContentLocale] = useState<Locale>("lv");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  useEffect(() => {
    if (!state.success) return;
    onClose();
  }, [state.success, onClose]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);

    if (photos.length !== EXCURSION_COLLAGE_PHOTO_COUNT) {
      setClientError(labels.photosHint);
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.delete("photos");
    formData.delete("photoSlots");
    formData.delete("existingPhotos");
    formData.set("logoVariant", logoVariant);

    setUploading(true);
    try {
      const uploadResults = await Promise.all(
        photos.map(async (photo) => {
          if (photo.src && !photo.file) return photo.src;
          if (!photo.file) return null;
          const uploadData = new FormData();
          uploadData.append("photo", photo.file);
          const response = await fetch("/api/staff/excursion-photo", {
            method: "POST",
            body: uploadData,
          });
          const payload = (await response.json().catch(() => null)) as
            | { ok?: boolean; url?: string; error?: string }
            | null;
          if (!response.ok || !payload?.ok || !payload.url) {
            throw new Error(payload?.error ?? labels.photosHint);
          }
          return payload.url;
        }),
      );

      const resolvedUrls = uploadResults.filter((url): url is string => Boolean(url));
      if (resolvedUrls.length !== EXCURSION_COLLAGE_PHOTO_COUNT) {
        setClientError(labels.photosHint);
        return;
      }

      for (const url of resolvedUrls) {
        formData.append("photoSlots", url);
        formData.append("existingPhotos", url);
      }

      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      setClientError(error instanceof Error ? error.message : labels.photosHint);
    } finally {
      setUploading(false);
    }
  }

  const regionLabels: Record<ExcursionRegion, string> = {
    latvia: labels.regionLatvia,
    estonia: labels.regionEstonia,
    lithuania: labels.regionLithuania,
    france: labels.regionFrance,
    belgium: labels.regionBelgium,
    baltics: labels.regionBaltics,
    germany: labels.regionGermany,
  };
  const selectedRegions = new Set(excursion?.regions ?? []);

  return (
    <div
      className="popup-enter-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-night/85 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="excursion-dialog-title"
        className="popup-enter my-4 w-full max-w-xl rounded-2xl border border-white/10 bg-card p-5 text-ivory shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="excursion-dialog-title" className="font-serif text-2xl tracking-wide">
            {mode === "add" ? labels.addTitle : labels.editTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="grid h-8 w-8 place-items-center rounded-full text-ivory/70 hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>

        <form noValidate onSubmit={onSubmit} className="mt-5 grid gap-4">
          {excursion ? <input type="hidden" name="id" value={excursion.id} /> : null}

          <div className="grid gap-3">
            <div
              role="tablist"
              aria-label="Content language"
              className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-white/5 p-1"
            >
              {locales.map((locale) => {
                const active = contentLocale === locale;
                return (
                  <button
                    key={locale}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setContentLocale(locale)}
                    className={[
                      "min-w-12 flex-1 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide transition",
                      active
                        ? "bg-burgundy text-white"
                        : "text-ivory/70 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    {localeFieldLabels[locale]}
                  </button>
                );
              })}
            </div>

            {locales.map((locale) => {
              const visible = contentLocale === locale;
              const requireTitle = locale === "lv";
              return (
                <div
                  key={locale}
                  role="tabpanel"
                  hidden={!visible}
                  className={visible ? "grid gap-4" : "hidden"}
                >
                  <Field label={labels.title}>
                    <input
                      name={`title_${locale}`}
                      required={requireTitle}
                      maxLength={160}
                      defaultValue={fieldLocaleValue(excursion?.title, locale)}
                      placeholder={
                        locale === "lv"
                          ? 'kabarē “Moulin Rouge” ar vakariņu piedāvājumu'
                          : undefined
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label={labels.route} hint={labels.routeHint}>
                    <input
                      name={`route_${locale}`}
                      maxLength={200}
                      defaultValue={fieldLocaleValue(excursion?.route, locale)}
                      placeholder={locale === "en" ? "Riga → Paris → Riga" : undefined}
                      className={inputClass}
                    />
                  </Field>

                  <Field label={labels.teaser} hint={labels.teaserHint}>
                    <textarea
                      name={`teaser_${locale}`}
                      rows={4}
                      maxLength={800}
                      defaultValue={fieldLocaleValue(excursion?.teaser, locale)}
                      className={textareaClass}
                    />
                  </Field>

                  <Field label={labels.details} hint={labels.detailsHint}>
                    <textarea
                      name={`details_${locale}`}
                      rows={10}
                      maxLength={8000}
                      defaultValue={fieldLocaleValue(excursion?.details, locale)}
                      className={textareaClass}
                    />
                  </Field>
                </div>
              );
            })}
          </div>

          <Field label={labels.price} hint={labels.priceHint}>
            <input
              name="price"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              defaultValue={excursion?.price ?? ""}
              placeholder="249"
              className={inputClass}
            />
          </Field>

          <Field label={labels.duration} hint={labels.durationHint}>
            <input
              name="durationDays"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              defaultValue={excursion?.durationDays ?? ""}
              placeholder="3"
              className={inputClass}
            />
          </Field>

          <fieldset className="grid gap-1.5">
            <legend className="text-[11px] font-medium tracking-wide text-ivory/80">
              {labels.region}
            </legend>
            <div className="grid gap-2 rounded-lg border border-white/10 bg-white/5 p-3 sm:grid-cols-2">
              {excursionRegions.map((region) => (
                <label
                  key={region}
                  className="flex items-center gap-2 text-sm font-normal text-ivory/90"
                >
                  <input
                    type="checkbox"
                    name="regions"
                    value={region}
                    defaultChecked={selectedRegions.has(region)}
                    className="size-4 rounded border-white/30 bg-white accent-burgundy"
                  />
                  {regionLabels[region]}
                </label>
              ))}
            </div>
            <span className="text-[11px] font-normal text-mist">{labels.regionHint}</span>
          </fieldset>

          <ExcursionCollagePhotos
            photos={photos}
            logoVariant={logoVariant}
            onPhotosChange={setPhotos}
            labels={{
              photos: labels.photos,
              photosHint: labels.photosHint,
              photoSize: labels.photoSize,
              upload: labels.upload,
              moveUp: labels.moveUp,
              moveDown: labels.moveDown,
              moveLeft: labels.moveLeft,
              moveRight: labels.moveRight,
              preview: labels.preview,
              slot: labels.slot,
            }}
          />

          {clientError || state.error ? (
            <p role="alert" className="text-xs text-red-300">
              {clientError ?? state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || uploading}
            className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-lg bg-burgundy px-4 text-sm font-semibold text-white hover:bg-burgundy-deep disabled:opacity-60"
          >
            {pending || uploading ? labels.saving : labels.save}
          </button>
        </form>
      </div>
    </div>
  );
}
