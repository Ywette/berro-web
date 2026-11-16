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
  region: string;
  regionNone: string;
  regionLatvia: string;
  regionFrance: string;
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
  const [photos, setPhotos] = useState<FleetPhotoDraft[]>(() => photosFromExcursion(excursion));
  const [logoVariant, setLogoVariant] = useState<ExcursionLogoVariant>(
    () => excursion?.logoVariant ?? "dark",
  );
  const [state, formAction, pending] = useActionState(saveManagedExcursion, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
      const resolvedUrls: string[] = [];
      for (const photo of photos) {
        if (photo.file) {
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
            setClientError(payload?.error ?? labels.photosHint);
            return;
          }
          resolvedUrls.push(payload.url);
        } else if (photo.src) {
          resolvedUrls.push(photo.src);
        }
      }

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
    } finally {
      setUploading(false);
    }
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

          <ExcursionCollagePhotos
            photos={photos}
            logoVariant={logoVariant}
            onPhotosChange={setPhotos}
            onLogoVariantChange={setLogoVariant}
            labels={{
              photos: labels.photos,
              photosHint: labels.photosHint,
              photoSize: labels.photoSize,
              upload: labels.upload,
              moveLeft: labels.moveLeft,
              moveRight: labels.moveRight,
              remove: labels.remove,
              logo: labels.logo,
              logoHint: labels.logoHint,
              logoDark: labels.logoDark,
              logoWhite: labels.logoWhite,
              preview: labels.preview,
              slot: labels.slot,
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
              rows={4}
              maxLength={800}
              defaultValue={excursion?.teaser ?? ""}
              className="w-full resize-y rounded-lg border border-white/10 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
            />
          </Field>

          <Field label={labels.details} hint={labels.detailsHint}>
            <textarea
              name="details"
              rows={10}
              maxLength={8000}
              defaultValue={excursion?.details ?? ""}
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
