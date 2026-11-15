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
import type { Locale } from "@/lib/i18n/locale";

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

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

    for (const photo of photos) {
      if (photo.file) {
        formData.append("photoSlots", "new");
        formData.append("photos", photo.file);
      } else if (photo.src) {
        formData.append("photoSlots", photo.src);
        formData.append("existingPhotos", photo.src);
      }
    }

    startTransition(() => {
      formAction(formData);
    });
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
          {vehicle ? <input type="hidden" name="id" value={vehicle.id} /> : null}

          {state.error ? (
            <p className="rounded-xl bg-burgundy/15 px-3 py-2 text-sm text-rose-200" role="alert">
              {state.error}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={labels.name} required>
              <input
                name="name"
                required
                maxLength={120}
                defaultValue={vehicle?.name ?? ""}
                className={inputClass}
              />
            </Field>
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
            <Field label={labels.bodyColor}>
              <input
                name="bodyColor"
                defaultValue={vehicle?.bodyColor ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label={labels.interiorColor}>
              <input
                name="interiorColor"
                defaultValue={vehicle?.interiorColor ?? ""}
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

          <Field label={labels.availableIn} required hint={labels.countriesHint}>
            <div className="flex flex-wrap gap-2">
              {fleetCountries.map((country) => {
                const checked = vehicle
                  ? vehicle.availableIn.includes(country.code)
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

          <Field label={labels.summary}>
            <input
              name="summary"
              defaultValue={vehicle?.summary ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label={labels.description} hint={labels.descriptionHint}>
            <textarea
              name="description"
              rows={4}
              defaultValue={vehicle?.description.join("\n") ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label={labels.extras} hint={labels.extrasHint}>
            <textarea
              name="extras"
              rows={3}
              defaultValue={vehicle?.extras.join("\n") ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label={labels.closingNotes} hint={labels.closingNotesHint}>
            <textarea
              name="closingNotes"
              rows={3}
              defaultValue={vehicle?.closingNotes.join("\n") ?? ""}
              className={inputClass}
            />
          </Field>

          <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-ivory hover:border-white/50"
            >
              {labels.close}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-burgundy-deep disabled:opacity-60"
            >
              {pending ? labels.savingTransport : labels.saveTransport}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-white/15 bg-night px-3 py-2 text-sm text-ivory [color-scheme:dark]";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs text-mist">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-mist/80">{hint}</span> : null}
    </label>
  );
}
