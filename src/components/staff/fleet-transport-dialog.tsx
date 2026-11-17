"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { saveFleetTransport, type FleetActionState } from "@/actions/fleet";
import { FleetPhotoManager, type FleetPhotoDraft } from "@/components/staff/fleet-photo-manager";
import { countryLabel, fleetCountries } from "@/lib/content/countries";
import type { FleetVehicle } from "@/lib/content/fleet";
import { prepareExcursionPhoto } from "@/lib/excursions/prepare-photo";
import {
  fleetPhotoFolderFromUrl,
  fleetVehiclePhotoFolder,
} from "@/lib/fleet/photo-folder";
import { locales, type Locale, type Localized } from "@/lib/i18n/locale";
import {
  joinLines,
  localeFieldLabels,
  type LocalizedLines,
} from "@/lib/i18n/localized-content";

export type FleetTransportDialogLabels = {
  addTitle: string;
  editTitle: string;
  close: string;
  saveTransport: string;
  savingTransport: string;
  kind: string;
  kindVan: string;
  kindCoach: string;
  kindVip: string;
  kindRetro: string;
  name: string;
  plate: string;
  capacity: string;
  guideSeats: string;
  insurance: string;
  inspection: string;
  availableIn: string;
  countriesHint: string;
  interiorColor: string;
  bodyColor: string;
  extras: string;
  extrasHint: string;
  summary: string;
  description: string;
  descriptionHint: string;
  closingNotes: string;
  closingNotesHint: string;
  photos: string;
  photosHint: string;
  uploadPhotos: string;
  mainPhoto: string;
  setMainPhoto: string;
  movePhotoLeft: string;
  movePhotoRight: string;
  removePhoto: string;
  videoUrl: string;
};

type FleetTransportDialogProps = {
  vehicle: FleetVehicle | null;
  mode: "add" | "edit";
  locale: Locale;
  labels: FleetTransportDialogLabels;
  onClose: () => void;
};

const initialState: FleetActionState = {};

function photosFromVehicle(vehicle: FleetVehicle | null): {
  photos: FleetPhotoDraft[];
  mainId: string | null;
} {
  if (!vehicle) return { photos: [], mainId: null };
  const ordered =
    vehicle.galleryImages.length > 0
      ? vehicle.galleryImages
      : vehicle.image
        ? [vehicle.image]
        : [];
  const photos = ordered.filter(Boolean).map((src, index) => ({
    id: `existing-${index}-${src}`,
    preview: src,
    src,
  }));
  const main =
    photos.find((photo) => photo.src === vehicle.image) ?? photos[0] ?? null;
  return { photos, mainId: main?.id ?? null };
}

/** Exact locale value for editing (no cross-locale fallback). */
function fieldLocaleValue(value: Localized | string | null | undefined, locale: Locale): string {
  if (value == null) return "";
  if (typeof value === "string") return locale === "lv" ? value : "";
  const text = value[locale];
  return typeof text === "string" ? text : "";
}

function linesLocaleValue(
  value: LocalizedLines | string[] | null | undefined,
  locale: Locale,
): string {
  if (value == null) return "";
  if (Array.isArray(value)) return locale === "lv" ? joinLines(value) : "";
  const lines = value[locale];
  return Array.isArray(lines) ? joinLines(lines) : "";
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-white/15 bg-night px-3 py-2 text-sm text-ivory [color-scheme:dark]";

const textareaClass =
  "mt-1.5 w-full resize-y rounded-lg border border-white/15 bg-night px-3 py-2 text-sm text-ivory [color-scheme:dark]";

function Field({
  label,
  required,
  hint,
  children,
  as = "label",
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  /** Use `div` when children include their own labels (e.g. checkboxes). */
  as?: "label" | "div";
}) {
  const Tag = as;
  return (
    <Tag className="block text-xs text-mist">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-mist/80">{hint}</span> : null}
    </Tag>
  );
}

export function FleetTransportDialog({
  vehicle,
  mode,
  locale,
  labels,
  onClose,
}: FleetTransportDialogProps) {
  const seed = photosFromVehicle(vehicle);
  const [photos, setPhotos] = useState<FleetPhotoDraft[]>(seed.photos);
  const [mainPhotoId, setMainPhotoId] = useState<string | null>(seed.mainId);
  const [state, formAction, pending] = useActionState(saveFleetTransport, initialState);
  const [uploading, setUploading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [contentLocale, setContentLocale] = useState<Locale>("lv");
  /** Stable id for new vehicles so photo folder matches the DB row. */
  const [vehicleKey] = useState(
    () => vehicle?.id ?? `fleet-${crypto.randomUUID()}`,
  );

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

  useEffect(() => {
    if (!state.error && !clientError) return;
    document.getElementById("fleet-transport-form-error")?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [state.error, clientError]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.delete("photos");
    formData.delete("photoSlots");
    formData.delete("existingPhotos");
    formData.delete("mainPhotoIndex");

    const mainIndex = Math.max(
      0,
      photos.findIndex((photo) => photo.id === mainPhotoId),
    );
    formData.set("mainPhotoIndex", String(mainIndex === -1 ? 0 : mainIndex));

    const nameLv = String(formData.get("name_lv") ?? formData.get("name") ?? "").trim();
    const existingFolder =
      photos
        .map((photo) => photo.src)
        .filter((src): src is string => Boolean(src))
        .map(fleetPhotoFolderFromUrl)
        .find(Boolean) ?? null;
    const photoFolder =
      existingFolder ||
      fleetVehiclePhotoFolder({
        vehicleId: vehicleKey,
        name: nameLv || undefined,
      });
    formData.set("id", vehicleKey);
    formData.set("photoFolder", photoFolder);

    // Re-sync country checkboxes from the live form (nested labels used to clear these).
    formData.delete("availableIn");
    const checkedCountries = Array.from(
      form.querySelectorAll<HTMLInputElement>('input[name="availableIn"]:checked'),
    ).map((input) => input.value);
    for (const code of checkedCountries) {
      formData.append("availableIn", code);
    }
    if (checkedCountries.length === 0) {
      setClientError(labels.countriesHint || "Select at least one country.");
      return;
    }

    setUploading(true);
    try {
      const resolvedUrls = await Promise.all(
        photos.map(async (photo) => {
          if (photo.src && !photo.file) return photo.src;
          if (!photo.file) return null;
          const prepared = await prepareExcursionPhoto(photo.file);
          const uploadData = new FormData();
          uploadData.append("photo", prepared);
          uploadData.append("vehicleId", vehicleKey);
          uploadData.append("vehicleName", nameLv);
          uploadData.append("folder", photoFolder);
          const response = await fetch("/api/staff/fleet-photo", {
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

      for (const url of resolvedUrls) {
        if (!url) continue;
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

  return (
    <div
      className="popup-enter-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-night/85 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={mode === "edit" ? labels.editTitle : labels.addTitle}
      onClick={onClose}
    >
      <div
        className="popup-enter-panel my-4 w-full max-w-3xl rounded-2xl border border-white/10 bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <h2 className="font-serif text-2xl tracking-wide text-ivory">
            {mode === "edit" ? labels.editTitle : labels.addTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-ivory hover:border-white/50"
          >
            {labels.close}
          </button>
        </div>

        <form
          key={vehicle?.id ?? "new"}
          onSubmit={onSubmit}
          className="space-y-4 px-5 py-5"
        >
          <input type="hidden" name="id" value={vehicleKey} />
          <input type="hidden" name="formMode" value={mode} />

          {clientError || state.error ? (
            <p
              id="fleet-transport-form-error"
              className="rounded-xl bg-burgundy/15 px-3 py-2 text-sm text-rose-200"
              role="alert"
            >
              {clientError ?? state.error}
            </p>
          ) : null}

          <div className="space-y-3">
            <div
              role="tablist"
              aria-label="Content language"
              className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-white/5 p-1"
            >
              {locales.map((tabLocale) => {
                const active = contentLocale === tabLocale;
                return (
                  <button
                    key={tabLocale}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setContentLocale(tabLocale)}
                    className={[
                      "min-w-12 flex-1 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide transition",
                      active
                        ? "bg-burgundy text-white"
                        : "text-ivory/70 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    {localeFieldLabels[tabLocale]}
                  </button>
                );
              })}
            </div>

            {locales.map((tabLocale) => {
              const visible = contentLocale === tabLocale;
              const requireName = tabLocale === "lv";
              return (
                <div
                  key={tabLocale}
                  role="tabpanel"
                  hidden={!visible}
                  className={visible ? "space-y-4" : "hidden"}
                >
                  <Field label={labels.name} required={requireName}>
                    <input
                      name={`name_${tabLocale}`}
                      required={requireName}
                      maxLength={120}
                      defaultValue={fieldLocaleValue(vehicle?.name, tabLocale)}
                      className={inputClass}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={labels.bodyColor}>
                      <input
                        name={`bodyColor_${tabLocale}`}
                        defaultValue={fieldLocaleValue(vehicle?.bodyColor, tabLocale)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label={labels.interiorColor}>
                      <input
                        name={`interiorColor_${tabLocale}`}
                        defaultValue={fieldLocaleValue(vehicle?.interiorColor, tabLocale)}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label={labels.summary}>
                    <input
                      name={`summary_${tabLocale}`}
                      defaultValue={fieldLocaleValue(vehicle?.summary, tabLocale)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label={labels.description} hint={labels.descriptionHint}>
                    <textarea
                      name={`description_${tabLocale}`}
                      rows={4}
                      defaultValue={linesLocaleValue(vehicle?.description, tabLocale)}
                      className={textareaClass}
                    />
                  </Field>

                  <Field label={labels.extras} hint={labels.extrasHint}>
                    <textarea
                      name={`extras_${tabLocale}`}
                      rows={3}
                      defaultValue={linesLocaleValue(vehicle?.extras, tabLocale)}
                      className={textareaClass}
                    />
                  </Field>

                  <Field label={labels.closingNotes} hint={labels.closingNotesHint}>
                    <textarea
                      name={`closingNotes_${tabLocale}`}
                      rows={3}
                      defaultValue={linesLocaleValue(vehicle?.closingNotes, tabLocale)}
                      className={textareaClass}
                    />
                  </Field>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={labels.kind} required>
              <select
                name="kind"
                required
                defaultValue={vehicle?.kind ?? "van"}
                className={inputClass}
              >
                <option value="van">{labels.kindVan}</option>
                <option value="coach">{labels.kindCoach}</option>
                <option value="vip">{labels.kindVip}</option>
                <option value="retro">{labels.kindRetro}</option>
              </select>
            </Field>
            <Field label={labels.plate}>
              <input
                name="plate"
                maxLength={32}
                defaultValue={vehicle?.plate ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label={labels.capacity} required>
              <input
                name="passengers"
                type="number"
                min={1}
                max={80}
                required
                defaultValue={vehicle?.passengers ?? 16}
                className={inputClass}
              />
            </Field>
            <Field label={labels.guideSeats}>
              <input
                name="guideSeats"
                type="number"
                min={0}
                max={5}
                defaultValue={vehicle?.guideSeats ?? 1}
                className={inputClass}
              />
            </Field>
            <Field label={labels.insurance}>
              <input
                name="insuranceExpiresOn"
                type="date"
                defaultValue={vehicle?.insuranceExpiresOn ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label={labels.inspection}>
              <input
                name="inspectionExpiresOn"
                type="date"
                defaultValue={vehicle?.inspectionExpiresOn ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label={labels.videoUrl}>
              <input
                name="videoUrl"
                placeholder="https://www.youtube.com/watch?v=…"
                defaultValue={vehicle?.videoUrl ?? ""}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label={labels.availableIn} required hint={labels.countriesHint} as="div">
            <div className="mt-1.5 flex flex-wrap gap-2">
              {fleetCountries.map((country) => {
                const selected = vehicle?.availableIn ?? [];
                const checked =
                  selected.length > 0
                    ? selected.includes(country.code)
                    : country.code === "LV";
                return (
                  <label
                    key={country.code}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 px-3 py-1.5 text-xs text-ivory"
                  >
                    <input
                      type="checkbox"
                      name="availableIn"
                      value={country.code}
                      defaultChecked={checked}
                    />
                    {countryLabel(country.code, locale)}
                  </label>
                );
              })}
            </div>
          </Field>

          <FleetPhotoManager
            photos={photos}
            mainId={mainPhotoId}
            onChange={(next, nextMain) => {
              setPhotos(next);
              setMainPhotoId(nextMain);
            }}
            labels={{
              photos: labels.photos,
              photosHint: labels.photosHint,
              upload: labels.uploadPhotos,
              main: labels.mainPhoto,
              setMain: labels.setMainPhoto,
              moveLeft: labels.movePhotoLeft,
              moveRight: labels.movePhotoRight,
              remove: labels.removePhoto,
            }}
          />

          <div className="space-y-3 border-t border-white/10 pt-4">
            {clientError || state.error ? (
              <p className="rounded-xl bg-burgundy/15 px-3 py-2 text-sm text-rose-200" role="alert">
                {clientError ?? state.error}
              </p>
            ) : null}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-ivory hover:border-white/50"
              >
                {labels.close}
              </button>
              <button
                type="submit"
                disabled={pending || uploading}
                className="rounded-full bg-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-burgundy-deep disabled:opacity-60"
              >
                {pending || uploading ? labels.savingTransport : labels.saveTransport}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
