"use client";

import { useId, useRef } from "react";
import { ExcursionCollage } from "@/components/excursions/excursion-collage";
import type { FleetPhotoDraft } from "@/components/staff/fleet-photo-manager";
import {
  EXCURSION_COLLAGE_PHOTO_COUNT,
  excursionLogoSrc,
  type ExcursionLogoVariant,
} from "@/lib/content/managed-excursion";

export type ExcursionCollagePhotoLabels = {
  photos: string;
  photosHint: string;
  upload: string;
  moveLeft: string;
  moveRight: string;
  remove: string;
  logo: string;
  logoHint: string;
  logoDark: string;
  logoWhite: string;
  preview: string;
  slot: string;
};

type ExcursionCollagePhotosProps = {
  photos: FleetPhotoDraft[];
  logoVariant: ExcursionLogoVariant;
  onPhotosChange: (photos: FleetPhotoDraft[]) => void;
  onLogoVariantChange: (variant: ExcursionLogoVariant) => void;
  labels: ExcursionCollagePhotoLabels;
};

export function ExcursionCollagePhotos({
  photos,
  logoVariant,
  onPhotosChange,
  onLogoVariantChange,
  labels,
}: ExcursionCollagePhotosProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const canUploadMore = photos.length < EXCURSION_COLLAGE_PHOTO_COUNT;

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const next = [...photos];
    const remaining = EXCURSION_COLLAGE_PHOTO_COUNT - next.length;
    for (const file of Array.from(fileList).slice(0, Math.max(0, remaining))) {
      if (!file.type.startsWith("image/")) continue;
      next.push({
        id: crypto.randomUUID(),
        preview: URL.createObjectURL(file),
        file,
      });
    }
    onPhotosChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(id: string, direction: -1 | 1) {
    const index = photos.findIndex((photo) => photo.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= photos.length) return;
    const next = [...photos];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    onPhotosChange(next);
  }

  function remove(id: string) {
    const photo = photos.find((item) => item.id === id);
    if (photo?.file) URL.revokeObjectURL(photo.preview);
    onPhotosChange(photos.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-mist">{labels.photos}</p>
          <p className="mt-1 text-[11px] text-mist/80">{labels.photosHint}</p>
        </div>
        {canUploadMore ? (
          <label
            htmlFor={inputId}
            className="cursor-pointer rounded-full border border-white/20 px-3 py-1.5 text-xs text-ivory hover:border-white/50"
          >
            {labels.upload}
          </label>
        ) : null}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          disabled={!canUploadMore}
          onChange={(event) => addFiles(event.target.files)}
        />
      </div>

      {photos.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[11px] text-mist">{labels.preview}</p>
          <ExcursionCollage
            images={photos.map((photo) => photo.preview)}
            logoVariant={logoVariant}
            alt=""
            unoptimized
            className="aspect-[4/3] w-full rounded-xl border border-white/10"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <div>
          <p className="text-xs text-mist">{labels.logo}</p>
          <p className="mt-1 text-[11px] text-mist/80">{labels.logoHint}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["dark", "white"] as const).map((variant) => {
            const selected = logoVariant === variant;
            return (
              <button
                key={variant}
                type="button"
                onClick={() => onLogoVariantChange(variant)}
                className={`rounded-xl border p-2 text-left transition ${
                  selected
                    ? "border-burgundy bg-burgundy/20"
                    : "border-white/12 bg-[#141418] hover:border-white/30"
                }`}
              >
                <span
                  className={`block rounded-lg px-2 py-2 ${
                    variant === "white" ? "bg-white" : "bg-black"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- static brand assets */}
                  <img
                    src={excursionLogoSrc[variant]}
                    alt=""
                    className="mx-auto h-8 w-auto object-contain"
                  />
                </span>
                <span className="mt-2 block text-[11px] text-ivory/90">
                  {variant === "dark" ? labels.logoDark : labels.logoWhite}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {photos.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className="overflow-hidden rounded-xl border border-white/12 bg-[#141418]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs + uploads */}
              <img src={photo.preview} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="space-y-2 p-2.5">
                <span className="text-[11px] text-mist">
                  {labels.slot} {index + 1}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => move(photo.id, -1)}
                    disabled={index === 0}
                    className="rounded-md border border-white/15 px-2 py-1 text-[11px] text-mist disabled:opacity-40"
                  >
                    {labels.moveLeft}
                  </button>
                  <button
                    type="button"
                    onClick={() => move(photo.id, 1)}
                    disabled={index === photos.length - 1}
                    className="rounded-md border border-white/15 px-2 py-1 text-[11px] text-mist disabled:opacity-40"
                  >
                    {labels.moveRight}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(photo.id)}
                    className="rounded-md border border-white/15 px-2 py-1 text-[11px] text-rose-200/90"
                  >
                    {labels.remove}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
