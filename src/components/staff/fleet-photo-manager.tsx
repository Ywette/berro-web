"use client";

import { useId, useRef, useState } from "react";
import { FLEET_PHOTO_MAX_COUNT } from "@/lib/fleet/photo-limits";

export type FleetPhotoDraft = {
  id: string;
  /** Object URL for new uploads, or existing public path. */
  preview: string;
  file?: File;
  src?: string;
};

type FleetPhotoManagerProps = {
  photos: FleetPhotoDraft[];
  mainId: string | null;
  onChange: (photos: FleetPhotoDraft[], mainId: string | null) => void;
  labels: {
    photos: string;
    photosHint: string;
    upload: string;
    main: string;
    setMain: string;
    moveLeft: string;
    moveRight: string;
    remove: string;
  };
};

export function FleetPhotoManager({ photos, mainId, onChange, labels }: FleetPhotoManagerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const canUploadMore = photos.length < FLEET_PHOTO_MAX_COUNT;

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const next = [...photos];
    let nextMain = mainId;
    const remaining = FLEET_PHOTO_MAX_COUNT - next.length;
    for (const file of Array.from(fileList).slice(0, Math.max(0, remaining))) {
      if (!file.type.startsWith("image/")) continue;
      const id = crypto.randomUUID();
      next.push({ id, preview: URL.createObjectURL(file), file });
      if (!nextMain) nextMain = id;
    }
    onChange(next, nextMain);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(id: string, direction: -1 | 1) {
    const index = photos.findIndex((photo) => photo.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= photos.length) return;
    const next = [...photos];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    onChange(next, mainId);
  }

  function remove(id: string) {
    const photo = photos.find((item) => item.id === id);
    if (photo?.file) URL.revokeObjectURL(photo.preview);
    const next = photos.filter((item) => item.id !== id);
    const nextMain = mainId === id ? (next[0]?.id ?? null) : mainId;
    onChange(next, nextMain);
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const from = photos.findIndex((photo) => photo.id === dragId);
    const to = photos.findIndex((photo) => photo.id === targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      return;
    }
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    onChange(next, mainId);
    setDragId(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-mist">{labels.photos}</p>
          <p className="mt-1 text-[11px] text-mist">{labels.photosHint}</p>
        </div>
        {canUploadMore ? (
          <label
            htmlFor={inputId}
            className="cursor-pointer rounded-full border border-staff-control px-3 py-1.5 text-xs text-ivory hover:border-staff-focus"
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
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => {
            const isMain = photo.id === mainId;
            return (
              <li
                key={photo.id}
                draggable
                onDragStart={() => setDragId(photo.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => onDrop(photo.id)}
                className={`overflow-hidden rounded-xl border bg-panel ${
                  isMain ? "border-burgundy" : "border-line"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URLs + uploads */}
                <img src={photo.preview} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="space-y-2 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-mist">#{index + 1}</span>
                    {isMain ? (
                      <span className="rounded-full bg-burgundy/25 px-2 py-0.5 text-[11px] text-staff-danger">
                        {labels.main}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onChange(photos, photo.id)}
                        className="text-[11px] text-ivory underline-offset-2 hover:text-ivory hover:underline"
                      >
                        {labels.setMain}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => move(photo.id, -1)}
                      disabled={index === 0}
                      className="rounded-md border border-staff-control px-2 py-1 text-[11px] text-mist disabled:opacity-40"
                    >
                      {labels.moveLeft}
                    </button>
                    <button
                      type="button"
                      onClick={() => move(photo.id, 1)}
                      disabled={index === photos.length - 1}
                      className="rounded-md border border-staff-control px-2 py-1 text-[11px] text-mist disabled:opacity-40"
                    >
                      {labels.moveRight}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(photo.id)}
                      className="rounded-md border border-staff-control px-2 py-1 text-[11px] text-staff-danger"
                    >
                      {labels.remove}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
