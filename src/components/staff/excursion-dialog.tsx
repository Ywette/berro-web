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
import { FleetPhotoManager, type FleetPhotoDraft } from "@/components/staff/fleet-photo-manager";
import { excursionRegions, type ExcursionRegion } from "@/lib/content/excursions";
import type { ManagedExcursion } from "@/lib/content/managed-excursion";

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
  region: string;
  regionNone: string;
  regionLatvia: string;
  regionFrance: string;
  regionBaltics: string;
  regionGermany: string;
  photos: string;
  photosHint: string;
  uploadPhotos: string;
  mainPhoto: string;
  setMainPhoto: string;
  movePhotoLeft: string;
  movePhotoRight: string;
  removePhoto: string;
};

type ExcursionDialogProps = {
  excursion: ManagedExcursion | null;
  mode: "add" | "edit";
  labels: ExcursionDialogLabels;
  onClose: () => void;
};

const initialState: ExcursionActionState = {};

function photosFromExcursion(excursion: ManagedExcursion | null): {
  photos: FleetPhotoDraft[];
  mainId: string | null;
} {
  if (!excursion?.image) return { photos: [], mainId: null };
  const photo = {
    id: `existing-0-${excursion.image}`,
    preview: excursion.image,
    src: excursion.image,
  };
  return { photos: [photo], mainId: photo.id };
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

export function ExcursionDialog({ excursion, mode, labels, onClose }: ExcursionDialogProps) {
  const seed = photosFromExcursion(excursion);
  const [photos, setPhotos] = useState<FleetPhotoDraft[]>(seed.photos);
  const [mainPhotoId, setMainPhotoId] = useState<string | null>(seed.mainId);
  const [state, formAction, pending] = useActionState(saveManagedExcursion, initialState);

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

  const regionLabels: Record<ExcursionRegion, string> = {
    latvia: labels.regionLatvia,
    france: labels.regionFrance,
    baltics: labels.regionBaltics,
    germany: labels.regionGermany,
  };

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

          <Field label={labels.title}>
            <input
              name="title"
              required
              maxLength={160}
              defaultValue={excursion?.title ?? ""}
              placeholder='kabarē “Moulin Rouge” ar vakariņu piedāvājumu'
              className={inputClass}
            />
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

          <Field label={labels.route} hint={labels.routeHint}>
            <input
              name="route"
              maxLength={200}
              defaultValue={excursion?.route ?? ""}
              placeholder="Riga → Paris → Riga"
              className={inputClass}
            />
          </Field>

          <Field label={labels.teaser} hint={labels.teaserHint}>
            <textarea
              name="teaser"
              rows={5}
              maxLength={800}
              defaultValue={excursion?.teaser ?? ""}
              className="w-full resize-y rounded-lg border border-white/10 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
            />
          </Field>

          <Field label={labels.region}>
            <select
              name="region"
              defaultValue={excursion?.region ?? ""}
              className={inputClass}
            >
              <option value="">{labels.regionNone}</option>
              {excursionRegions.map((region) => (
                <option key={region} value={region}>
                  {regionLabels[region]}
                </option>
              ))}
            </select>
          </Field>

          {state.error ? (
            <p role="alert" className="text-xs text-red-300">
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-lg bg-burgundy px-4 text-sm font-semibold text-white hover:bg-burgundy-deep disabled:opacity-60"
          >
            {pending ? labels.saving : labels.save}
          </button>
        </form>
      </div>
    </div>
  );
}
