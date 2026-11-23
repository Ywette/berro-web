"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { saveManagedExcursion, translateManagedExcursion, type ExcursionActionState } from "@/actions/excursions";
import {
  ExcursionCollagePhotos,
  type ExcursionCollagePhotoLabels,
} from "@/components/staff/excursion-collage-photos";
import type { FleetPhotoDraft } from "@/components/staff/fleet-photo-manager";
import { excursionRegions, type ExcursionRegion } from "@/lib/content/excursions";
import {
  excursionTextFields,
  excursionTextLimits,
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
  details: string;
  detailsHint: string;
  translate: string;
  translating: string;
  translationFailed: string;
  translationDone: string;
  translationNoFields: string;
  descriptionDocument: string;
  descriptionDocumentHint: string;
  removeDescriptionDocument: string;
  undoDescriptionDocumentRemoval: string;
  descriptionDocumentRemovalPending: string;
  price: string;
  priceHint: string;
  duration: string;
  durationHint: string;
  registrationOpen: string;
  plannedDate: string;
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

function textControl(form: HTMLFormElement, name: string) {
  const control = form.elements.namedItem(name);
  return control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement ? control : null;
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
    <label className="grid gap-1.5 text-[11px] font-medium tracking-wide text-ivory">
      {label}
      {children}
      {hint ? <span className="text-[11px] font-normal text-mist">{hint}</span> : null}
    </label>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-line bg-card px-3 text-sm text-ivory outline-none";

const textareaClass =
  "w-full resize-y rounded-lg border border-line bg-card px-3 py-2 text-sm text-ivory outline-none";

export function ExcursionDialog({ excursion, mode, labels, onClose }: ExcursionDialogProps) {
  const [photos, setPhotos] = useState<FleetPhotoDraft[]>(() => photosFromExcursion(excursion));
  const logoVariant: ExcursionLogoVariant = excursion?.logoVariant ?? "dark";
  const [state, formAction, pending] = useActionState(saveManagedExcursion, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [removeDocument, setRemoveDocument] = useState(false);
  const [translationFeedback, setTranslationFeedback] = useState<{ message: string; error: boolean } | null>(null);
  const [contentLocale, setContentLocale] = useState<Locale>("lv");
  const [registrationOpen, setRegistrationOpen] = useState(excursion?.isActive ?? false);
  const [plannedDate, setPlannedDate] = useState(excursion?.plannedDate ?? "");

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

  async function translate(form: HTMLFormElement | null) {
    if (!form || translating || uploading || pending) return;
    const input = new FormData();
    const targets = new Map<string, { sourceName: string; sourceValue: string; previous: string }>();

    for (const field of excursionTextFields) {
      const sourceName = `${field}_lv`;
      const sourceValue = textControl(form, sourceName)?.value.trim();
      if (!sourceValue) continue;
      input.set(sourceName, sourceValue);
      for (const locale of locales) {
        if (locale === "lv") continue;
        const name = `${field}_${locale}`;
        const previous = textControl(form, name)?.value.trim() ?? "";
        // Older saves may contain copies of the Latvian text in untranslated fields.
        if (previous && previous !== sourceValue) continue;
        targets.set(name, { sourceName, sourceValue, previous });
        input.append("target", name);
      }
    }
    if (!targets.size) {
      setTranslationFeedback({ message: labels.translationNoFields, error: false });
      return;
    }

    setTranslating(true);
    setTranslationFeedback(null);
    try {
      const result = await translateManagedExcursion(input);
      if (!form.isConnected) return;
      if ("error" in result) {
        setTranslationFeedback({ message: result.error, error: true });
        return;
      }
      let applied = 0;
      for (const [name, target] of targets) {
        const control = textControl(form, name);
        if (!control || control.value.trim() !== target.previous ||
          textControl(form, target.sourceName)?.value.trim() !== target.sourceValue) continue;
        control.value = result.translations[name];
        applied++;
      }
      setTranslationFeedback({
        message: applied ? labels.translationDone : labels.translationNoFields,
        error: false,
      });
    } catch {
      if (form.isConnected) setTranslationFeedback({ message: labels.translationFailed, error: true });
    } finally {
      if (form.isConnected) setTranslating(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (translating || uploading || pending) return;
    setClientError(null);

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
      if (resolvedUrls.length !== photos.length) {
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
        className="popup-enter my-4 w-full max-w-xl rounded-2xl border border-line bg-card p-5 text-ivory shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)] sm:p-6"
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
            className="grid h-8 w-8 place-items-center rounded-full text-ivory hover:bg-staff-hover hover:text-ivory"
          >
            ×
          </button>
        </div>

        <form noValidate onSubmit={onSubmit} className="mt-5 grid gap-4">
          {excursion ? <input type="hidden" name="id" value={excursion.id} /> : null}

          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={(event) => void translate(event.currentTarget.form)}
                disabled={translating || uploading || pending}
                className="rounded-full border border-staff-control px-4 py-2 text-sm font-medium text-ivory hover:border-staff-focus disabled:opacity-60"
              >
                {translating ? labels.translating : labels.translate}
              </button>
              {translationFeedback && (
                <p role={translationFeedback.error ? "alert" : "status"} className={translationFeedback.error ? "text-sm text-staff-danger" : "text-sm text-mist"}>
                  {translationFeedback.message}
                </p>
              )}
            </div>
            <div
              role="tablist"
              aria-label="Content language"
              className="flex flex-wrap gap-1 rounded-lg border border-line bg-staff-subtle p-1"
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
                        ? "bg-burgundy text-staff-on-accent"
                        : "text-ivory hover:bg-staff-hover hover:text-ivory",
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
                      maxLength={excursionTextLimits.title}
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
                      maxLength={excursionTextLimits.route}
                      defaultValue={fieldLocaleValue(excursion?.route, locale)}
                      placeholder={locale === "en" ? "Riga → Paris → Riga" : undefined}
                      className={inputClass}
                    />
                  </Field>

                  <Field label={labels.details} hint={labels.detailsHint}>
                    <textarea
                      name={`details_${locale}`}
                      rows={10}
                      maxLength={excursionTextLimits.details}
                      defaultValue={fieldLocaleValue(excursion?.details, locale)}
                      className={textareaClass}
                    />
                  </Field>
                </div>
              );
            })}
          </div>

          <div className="grid gap-2">
            <Field label={labels.descriptionDocument} hint={labels.descriptionDocumentHint}>
              <input
                name="descriptionDocument"
                type="file"
                disabled={removeDocument}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ivory disabled:opacity-60"
              />
            </Field>
            {excursion?.descriptionDocument && (
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`/api/staff/document?excursionId=${encodeURIComponent(excursion.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm text-ivory underline"
                >
                  {excursion.descriptionDocument.fileName}
                </a>
                <button
                  type="button"
                  disabled={pending || uploading}
                  onClick={() => setRemoveDocument((remove) => !remove)}
                  className="rounded-full border border-staff-danger-line px-3 py-1.5 text-xs font-medium text-staff-danger disabled:opacity-60"
                >
                  {removeDocument ? labels.undoDescriptionDocumentRemoval : labels.removeDescriptionDocument}
                </button>
                {removeDocument && (
                  <>
                    <input type="hidden" name="removeDescriptionDocument" value={excursion.descriptionDocument.filePath} />
                    <p role="status" className="w-full text-sm text-mist">{labels.descriptionDocumentRemovalPending}</p>
                  </>
                )}
              </div>
            )}
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

          <label className="flex items-center gap-2 text-sm text-ivory">
            <input
              type="checkbox"
              name="isActive"
              checked={registrationOpen}
              onChange={(event) => setRegistrationOpen(event.target.checked)}
              className="size-4 accent-burgundy"
            />
            {labels.registrationOpen}
          </label>

          {registrationOpen ? (
            <Field label={labels.plannedDate}>
              <input
                type="date"
                name="plannedDate"
                value={plannedDate}
                onChange={(event) => setPlannedDate(event.target.value)}
                className={inputClass}
              />
            </Field>
          ) : (
            <input type="hidden" name="plannedDate" value={plannedDate} />
          )}

          <fieldset className="grid gap-1.5">
            <legend className="text-[11px] font-medium tracking-wide text-ivory">
              {labels.region}
            </legend>
            <div className="grid gap-2 rounded-lg border border-line bg-staff-subtle p-3 sm:grid-cols-2">
              {excursionRegions.map((region) => (
                <label
                  key={region}
                  className="flex items-center gap-2 text-sm font-normal text-ivory"
                >
                  <input
                    type="checkbox"
                    name="regions"
                    value={region}
                    defaultChecked={selectedRegions.has(region)}
                    className="size-4 rounded border-staff-control bg-card accent-burgundy"
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
            labels={labels}
          />

          {clientError || state.error ? (
            <p role="alert" className="text-xs text-staff-danger">
              {clientError ?? state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || uploading || translating}
            className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-lg bg-burgundy px-4 text-sm font-semibold text-staff-on-accent hover:bg-burgundy-deep disabled:opacity-60"
          >
            {pending || uploading ? labels.saving : labels.save}
          </button>
        </form>
      </div>
    </div>
  );
}
