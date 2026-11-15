"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { TransportPhotoStrip } from "@/components/autoparks/transport-photo-strip";
import { countryLabel } from "@/lib/content/countries";
import type { FleetVehicle } from "@/lib/content/fleet";
import {
  formatTransportSeats,
  toYouTubeEmbedUrl,
  transportSectionAnchors,
  transportSections,
  type TransportPhoto,
  type TransportSectionId,
} from "@/lib/content/transport";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

type TransportCatalogProps = {
  vehicles: FleetVehicle[];
  locale: Locale;
  labels: Dictionary["autoparks"];
};

const sectionKinds: Record<TransportSectionId, FleetVehicle["kind"][]> = {
  minibuses: ["van", "minibus"],
  coaches: ["coach"],
  carRental: ["vip"],
  retroCarRental: ["retro"],
};

export function TransportCatalog({ vehicles, locale, labels }: TransportCatalogProps) {
  const active = useMemo(() => vehicles.filter((vehicle) => vehicle.isActive), [vehicles]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = active.find((vehicle) => vehicle.id === selectedId) ?? null;

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const target = document.getElementById(hash);
    if (!target) return;
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  if (active.length === 0) {
    return <p className="mt-10 text-sm text-mist">{labels.empty}</p>;
  }

  return (
    <div className="mt-10 flex flex-col gap-14">
      {transportSections.map((section) => (
        <TransportSection
          key={section}
          section={section}
          title={labels.sections[section]}
          vehicles={active.filter((vehicle) => sectionKinds[section].includes(vehicle.kind))}
          selectedId={selectedId}
          onOpen={setSelectedId}
          labels={labels}
        />
      ))}

      {selected ? (
        <TransportSummaryDialog
          vehicle={selected}
          locale={locale}
          labels={labels}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </div>
  );
}

function TransportSection({
  section,
  title,
  vehicles,
  selectedId,
  onOpen,
  labels,
}: {
  section: TransportSectionId;
  title: string;
  vehicles: FleetVehicle[];
  selectedId: string | null;
  onOpen: (id: string) => void;
  labels: Dictionary["autoparks"];
}) {
  const anchor = transportSectionAnchors[section];

  return (
    <section
      id={anchor}
      aria-labelledby={`autoparks-${section}`}
      className="scroll-mt-[calc(var(--site-header-height)+1.5rem)]"
    >
      <h2 id={`autoparks-${section}`} className="text-sm font-medium tracking-wide text-ivory uppercase">
        {title}
      </h2>

      {vehicles.length === 0 ? (
        <p className="mt-4 text-sm text-mist">{labels.sectionEmpty}</p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => {
            const seats = formatTransportSeats(vehicle);
            const active = vehicle.id === selectedId;
            const primary = vehicle.image || vehicle.galleryImages[0] || "";

            return (
              <article
                key={vehicle.id}
                className={`relative rounded-2xl border bg-[#141418] p-3.5 text-left transition ${
                  active ? "border-burgundy" : "border-white/10 hover:border-white/25"
                }`}
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#0c0c0f]">
                  {primary ? (
                    // eslint-disable-next-line @next/next/no-img-element -- full vehicle visible, no crop
                    <img
                      src={primary}
                      alt=""
                      className="h-full w-full object-contain object-center"
                    />
                  ) : null}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-xl"
                    style={{
                      background:
                        "radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.35) 82%, rgba(0,0,0,0.72) 100%)",
                    }}
                  />
                </div>
                <h3 className="mt-4 line-clamp-2 text-sm font-medium text-ivory">{vehicle.name}</h3>
                <p className="mt-2 flex items-center gap-2 text-xs text-mist">
                  <SeatIcon />
                  <span>{seats}</span>
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpen(vehicle.id)}
                    className="rounded-md border border-white/15 px-2.5 py-1 text-[11px] text-ivory/80 hover:border-white/40"
                  >
                    {labels.details}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function TransportSummaryDialog({
  vehicle,
  locale,
  labels,
  onClose,
}: {
  vehicle: FleetVehicle;
  locale: Locale;
  labels: Dictionary["autoparks"];
  onClose: () => void;
}) {
  const titleId = useId();
  const photos = toVehiclePhotos(vehicle);
  const primarySrc = vehicle.image || photos[0]?.src || "";
  const videoEmbed = toYouTubeEmbedUrl(vehicle.videoUrl);
  const countries =
    vehicle.availableIn.length > 0
      ? vehicle.availableIn.map((code) => countryLabel(code, locale)).join(", ")
      : null;

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

  return (
    <div
      className="popup-enter-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-night/85 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="popup-enter-panel relative my-4 w-full max-w-3xl rounded-2xl border border-white/10 bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full border border-white/20 bg-card/90 px-3 py-1.5 text-xs text-ivory hover:border-white/50"
        >
          {labels.galleryClose}
        </button>

        <div className="space-y-6 px-5 py-5">
          <div>
            {primarySrc ? (
              // eslint-disable-next-line @next/next/no-img-element -- full natural aspect for fleet previews
              <img
                src={primarySrc}
                alt={vehicle.name}
                className="h-auto w-full rounded-xl border border-white/10 bg-[#141418]"
              />
            ) : null}
            <TransportPhotoStrip
              photos={photos}
              locale={locale}
              closeLabel={labels.galleryClose}
              prevLabel={labels.galleryPrev}
              nextLabel={labels.galleryNext}
            />
            {videoEmbed ? (
              <div className="mt-4">
                <p className="text-xs tracking-wide text-mist uppercase">{labels.video}</p>
                <div className="mt-2 aspect-video overflow-hidden rounded-xl border border-white/10 bg-night">
                  <iframe
                    src={videoEmbed}
                    title={`${vehicle.name} — ${labels.video}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-8">
            <h2 id={titleId} className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {vehicle.name}
            </h2>

            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <PeopleIcon />
                <div>
                  <dt className="text-sm text-white/55">{labels.seats}</dt>
                  <dd className="mt-1 text-base font-semibold text-white">
                    {vehicle.passengers} {labels.passengers.toLowerCase()}
                  </dd>
                </div>
              </div>
              {vehicle.interiorColor ? (
                <div className="flex items-start gap-3">
                  <CabinIcon />
                  <div>
                    <dt className="text-sm text-white/55">{labels.interiorColor}</dt>
                    <dd className="mt-1 text-base font-semibold text-white">{vehicle.interiorColor}</dd>
                  </div>
                </div>
              ) : null}
              {countries ? (
                <div className="flex items-start gap-3">
                  <PinIcon />
                  <div>
                    <dt className="text-sm text-white/55">{labels.availableIn}</dt>
                    <dd className="mt-1 text-base font-semibold text-white">{countries}</dd>
                  </div>
                </div>
              ) : null}
            </dl>

            {vehicle.summary || vehicle.description.length > 0 ? (
              <section>
                <h3 className="text-lg font-semibold text-white">{labels.descriptionHeading}</h3>
                <div className="mt-3 space-y-3 text-sm leading-7 text-white/80">
                  {vehicle.summary ? <p>{vehicle.summary}</p> : null}
                  {vehicle.description.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ) : null}

            {vehicle.extras.length > 0 ? (
              <section>
                <h3 className="text-lg font-semibold text-white">{labels.amenities}</h3>
                <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 text-sm text-white/85 sm:grid-cols-2">
                  {vehicle.extras.map((extra) => (
                    <li key={extra} className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span>{extra}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {vehicle.closingNotes.length > 0 ? (
              <ul className="space-y-1.5 text-sm text-white/65">
                {vehicle.closingNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : null}

            <Link
              href="/#book"
              className="inline-flex rounded-full bg-burgundy px-5 py-2.5 text-sm font-medium text-white hover:bg-burgundy-deep"
            >
              {labels.inquire}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function toVehiclePhotos(vehicle: FleetVehicle): TransportPhoto[] {
  const ordered =
    vehicle.galleryImages.length > 0
      ? vehicle.galleryImages
      : vehicle.image
        ? [vehicle.image]
        : [];
  const srcs = [...new Set(ordered.filter(Boolean))];

  return srcs.map((src, index) => ({
    id: `${vehicle.id}-photo-${index}`,
    src,
    kind: vehicle.kind,
    showInGallery: false,
    alt: {
      lv: vehicle.name,
      en: vehicle.name,
      fr: vehicle.name,
      ru: vehicle.name,
    },
  }));
}

function SeatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M8 4h5a3 3 0 0 1 3 3v7H8V4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6 14h12v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-white" aria-hidden="true">
      <path
        d="M9 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm7.5 0a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 16.5 11Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3.5 19.5c.8-2.6 2.9-4 5.5-4s4.7 1.4 5.5 4M14 15.5c1.7-.2 3.3.5 4.5 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CabinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-white" aria-hidden="true">
      <circle cx="12" cy="12" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 4.75v2.5M12 16.75v2.5M4.75 12h2.5M16.75 12h2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-white" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="11" r="2.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true">
      <path
        d="M4.5 10.5 8 14l7.5-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
