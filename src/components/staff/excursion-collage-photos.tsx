"use client";

import { useId, useRef, useState } from "react";
import type { FleetPhotoDraft } from "@/components/staff/fleet-photo-manager";
import {
  EXCURSION_COLLAGE_PHOTO_COUNT,
  excursionLogoSrc,
  type ExcursionLogoVariant,
} from "@/lib/content/managed-excursion";
import { prepareExcursionPhoto } from "@/lib/excursions/prepare-photo";

export type ExcursionCollagePhotoLabels = {
  photos: string;
  photosHint: string;
  photoSize: string;
  upload: string;
  moveUp: string;
  moveDown: string;
  moveLeft: string;
  moveRight: string;
  preview: string;
  slot: string;
};

type ExcursionCollagePhotosProps = {
  photos: FleetPhotoDraft[];
  logoVariant: ExcursionLogoVariant;
  onPhotosChange: (photos: FleetPhotoDraft[]) => void;
  labels: ExcursionCollagePhotoLabels;
};

type MoveDirection = "up" | "down" | "left" | "right";

function neighborIndex(index: number, direction: MoveDirection): number | null {
  switch (direction) {
    case "up":
      return index >= 2 ? index - 2 : null;
    case "down":
      return index < 2 ? index + 2 : null;
    case "left":
      return index % 2 === 1 ? index - 1 : null;
    case "right":
      return index % 2 === 0 ? index + 1 : null;
  }
}

function ArrowButton({
  label,
  direction,
  disabled,
  onClick,
}: {
  label: string;
  direction: MoveDirection;
  disabled: boolean;
  onClick: () => void;
}) {
  const positionClass =
    direction === "up"
      ? "left-1/2 top-1.5 -translate-x-1/2"
      : direction === "down"
        ? "bottom-1.5 left-1/2 -translate-x-1/2"
        : direction === "left"
          ? "left-1.5 top-1/2 -translate-y-1/2"
          : "right-1.5 top-1/2 -translate-y-1/2";

  const icon =
    direction === "up" ? "↑" : direction === "down" ? "↓" : direction === "left" ? "←" : "→";

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`absolute z-10 grid size-7 place-items-center rounded-full border border-white/40 bg-night/75 text-sm text-ivory shadow-sm backdrop-blur-sm transition hover:bg-night/90 disabled:pointer-events-none disabled:opacity-0 ${positionClass}`}
    >
      {icon}
    </button>
  );
}

export function ExcursionCollagePhotos({
  photos,
  logoVariant,
  onPhotosChange,
  labels,
}: ExcursionCollagePhotosProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [targetSlot, setTargetSlot] = useState<number | null>(null);
  const canUploadMore = photos.length < EXCURSION_COLLAGE_PHOTO_COUNT;
  const logoSrc = excursionLogoSrc[logoVariant];
  const plateClass =
    logoVariant === "white"
      ? "bg-white shadow-[0_12px_28px_-10px_rgba(0,0,0,0.45)]"
      : "bg-black shadow-[0_12px_28px_-10px_rgba(0,0,0,0.65)]";

  const slots: Array<FleetPhotoDraft | null> = Array.from(
    { length: EXCURSION_COLLAGE_PHOTO_COUNT },
    (_, index) => photos[index] ?? null,
  );

  async function addFiles(fileList: FileList | null, slotIndex: number | null) {
    if (!fileList || fileList.length === 0) return;
    setProcessError(null);

    const replacing = slotIndex !== null && Boolean(photos[slotIndex]);
    const remaining = replacing
      ? 1
      : Math.max(0, EXCURSION_COLLAGE_PHOTO_COUNT - photos.length);
    const selected = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remaining);
    if (selected.length === 0) {
      if (inputRef.current) inputRef.current.value = "";
      setTargetSlot(null);
      return;
    }

    setProcessing(true);
    try {
      const preparedList: Array<FleetPhotoDraft | null> = await Promise.all(
        selected.map(async (file) => {
          try {
            const prepared = await prepareExcursionPhoto(file);
            const draft: FleetPhotoDraft = {
              id: crypto.randomUUID(),
              preview: URL.createObjectURL(prepared),
              file: prepared,
            };
            return draft;
          } catch {
            return null;
          }
        }),
      );
      const added = preparedList.filter((item): item is FleetPhotoDraft => item !== null);
      if (added.length < selected.length) {
        setProcessError(labels.photoSize);
      }
      if (added.length === 0) return;

      if (slotIndex !== null && photos[slotIndex]) {
        const next = [...photos];
        const previous = next[slotIndex];
        if (previous?.file) URL.revokeObjectURL(previous.preview);
        next[slotIndex] = added[0]!;
        onPhotosChange(next);
      } else {
        onPhotosChange([...photos, ...added].slice(0, EXCURSION_COLLAGE_PHOTO_COUNT));
      }
    } finally {
      setProcessing(false);
      setTargetSlot(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function swap(index: number, direction: MoveDirection) {
    const target = neighborIndex(index, direction);
    if (target === null) return;
    if (!photos[index] || !photos[target]) return;
    const next = [...photos];
    const temp = next[index]!;
    next[index] = next[target]!;
    next[target] = temp;
    onPhotosChange(next);
  }

  function openPicker(slotIndex: number | null) {
    const replacing = slotIndex !== null && Boolean(photos[slotIndex]);
    if (!replacing && !canUploadMore) return;
    setTargetSlot(slotIndex);
    inputRef.current?.click();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-mist">{labels.photos}</p>
          <p className="mt-1 text-[11px] text-mist/80">{labels.photosHint}</p>
          {processError ? (
            <p className="mt-1 text-[11px] text-rose-200/90" role="alert">
              {processError}
            </p>
          ) : null}
        </div>
        {canUploadMore ? (
          <button
            type="button"
            onClick={() => openPicker(null)}
            disabled={processing}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-ivory hover:border-white/50 disabled:opacity-60"
          >
            {labels.upload}
          </button>
        ) : null}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple={targetSlot === null}
          className="sr-only"
          disabled={processing}
          onChange={(event) => {
            void addFiles(event.target.files, targetSlot);
          }}
        />
      </div>

      <div>
        <p className="mb-2 text-[11px] text-mist">{labels.preview}</p>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 bg-night">
            {slots.map((photo, index) => {
              const canUp = neighborIndex(index, "up") !== null && Boolean(photos[index]) && Boolean(photos[neighborIndex(index, "up")!]);
              const canDown =
                neighborIndex(index, "down") !== null &&
                Boolean(photos[index]) &&
                Boolean(photos[neighborIndex(index, "down")!]);
              const canLeft =
                neighborIndex(index, "left") !== null &&
                Boolean(photos[index]) &&
                Boolean(photos[neighborIndex(index, "left")!]);
              const canRight =
                neighborIndex(index, "right") !== null &&
                Boolean(photos[index]) &&
                Boolean(photos[neighborIndex(index, "right")!]);

              return (
                <div key={photo?.id ?? `empty-${index}`} className="relative min-h-0 overflow-hidden bg-[#242426]">
                  {photo ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openPicker(index)}
                        disabled={processing}
                        className="absolute inset-0"
                        aria-label={`${labels.slot} ${index + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- object URLs in staff preview */}
                        <img
                          src={photo.preview}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </button>
                      <ArrowButton
                        label={labels.moveUp}
                        direction="up"
                        disabled={!canUp}
                        onClick={() => swap(index, "up")}
                      />
                      <ArrowButton
                        label={labels.moveDown}
                        direction="down"
                        disabled={!canDown}
                        onClick={() => swap(index, "down")}
                      />
                      <ArrowButton
                        label={labels.moveLeft}
                        direction="left"
                        disabled={!canLeft}
                        onClick={() => swap(index, "left")}
                      />
                      <ArrowButton
                        label={labels.moveRight}
                        direction="right"
                        disabled={!canRight}
                        onClick={() => swap(index, "right")}
                      />
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openPicker(index)}
                      disabled={processing || !canUploadMore}
                      className="absolute inset-0 grid place-items-center text-xs text-mist hover:bg-white/5 disabled:opacity-50"
                    >
                      <span className="rounded-full border border-dashed border-white/25 px-3 py-1.5">
                        {labels.slot} {index + 1}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3">
            <div
              className={`flex w-[42%] max-w-[9.5rem] flex-col items-center rounded-xl px-2.5 py-2 sm:rounded-2xl sm:px-3 sm:py-2.5 ${plateClass}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- staff preview */}
              <img src={logoSrc} alt="Berro Travel" className="h-auto w-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
