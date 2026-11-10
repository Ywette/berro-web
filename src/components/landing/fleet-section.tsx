import Image from "next/image";
import Link from "next/link";
import { fleetModels } from "@/lib/content/fleet";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function FleetSection() {
  const dictionary = await getDictionary();

  return (
    <section id="fleet" className="scroll-mt-[var(--site-header-height)] bg-night">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-medium text-ivory sm:text-3xl">{dictionary.fleet.title}</h2>
          <Link
            href="/contact"
            className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-ivory/80 hover:border-white/40"
          >
            {dictionary.fleet.details}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {fleetModels.map((vehicle) => (
            <article
              key={vehicle.id}
              className="relative rounded-2xl border border-white/10 bg-[#141418] p-3.5"
            >
              <span className="absolute top-3.5 right-3.5 z-10 h-2 w-2 rounded-full bg-red-600" />
              <div className="relative h-28">
                <Image
                  src={vehicle.image}
                  alt={vehicle.name}
                  fill
                  sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 90vw"
                  className="object-contain"
                />
              </div>
              <h3 className="mt-4 text-sm font-medium text-ivory">{vehicle.name}</h3>
              <p className="mt-2 flex items-center gap-2 text-xs text-mist">
                <PeopleIcon />
                {vehicle.passengers} {dictionary.fleet.passengers}
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-mist">
                <li className="inline-flex items-center gap-1">
                  <WifiIcon /> {dictionary.fleet.wifi}
                </li>
                <li className="inline-flex items-center gap-1">
                  <SeatIcon /> {dictionary.fleet.leather}
                </li>
                <li className="inline-flex items-center gap-1">
                  <SnowIcon /> {dictionary.fleet.ac}
                </li>
              </ul>
              <div className="mt-4 flex justify-end">
                <Link
                  href="/#book"
                  className="rounded-md border border-white/15 px-2.5 py-1 text-[11px] text-ivory/80 hover:border-white/40"
                >
                  {dictionary.fleet.details}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="9" cy="8" r="2.4" fill="currentColor" />
      <circle cx="16" cy="9" r="2" fill="currentColor" />
      <path d="M4.5 18c.8-2.4 2.6-3.6 4.6-3.6S13 15.6 13.8 18" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 18c.5-1.8 1.7-2.8 3.2-2.8 1.4 0 2.6.9 3.2 2.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M4 10c4.4-4 11.6-4 16 0M7 13.2c2.8-2.4 7.2-2.4 10 0M10 16.2c1.2-1 2.8-1 4 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}

function SeatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M8 4h5a3 3 0 0 1 3 3v7H8V4Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 14h12v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SnowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M12 3v18M5 7.5l14 9M19 7.5l-14 9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
