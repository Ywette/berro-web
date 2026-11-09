import type { Dictionary } from "@/lib/i18n/dictionary";
import type { TripRoute } from "@/lib/places/types";
import { formatDistance, formatDuration } from "@/lib/quote";

type RouteSummaryProps = {
  pickup: string;
  dropoff: string;
  route: TripRoute;
  dictionary: Dictionary;
};

export function RouteSummary({ pickup, dropoff, route, dictionary }: RouteSummaryProps) {
  const distance = formatDistance(route, dictionary.locale);
  const duration = formatDuration(route.durationMinutes);

  return (
    <section className="mt-8 grid gap-3 rounded-xl border border-white/10 bg-card p-4">
      <p className="text-xs tracking-[0.18em] text-burgundy uppercase">{dictionary.quote.route}</p>
      <p className="text-sm text-ivory">
        {pickup} <span className="text-mist">→</span> {dropoff}
      </p>
      {distance || duration ? (
        <dl className="flex flex-wrap gap-x-8 gap-y-2">
          {distance ? (
            <div>
              <dt className="text-xs text-mist">{dictionary.quote.distance}</dt>
              <dd className="font-serif text-2xl text-ivory">
                {distance}
                {route.estimated ? (
                  <span className="ml-2 font-sans text-xs text-mist">({dictionary.quote.approximate})</span>
                ) : null}
              </dd>
            </div>
          ) : null}
          {duration ? (
            <div>
              <dt className="text-xs text-mist">{dictionary.quote.drivingTime}</dt>
              <dd className="font-serif text-2xl text-ivory">{duration}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      {route.embedUrl ? (
        <iframe
          src={route.embedUrl}
          title={dictionary.quote.route}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="aspect-video w-full rounded-lg border-0"
        />
      ) : null}
      <a
        href={route.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start text-sm text-ivory underline decoration-burgundy underline-offset-4 hover:text-white"
      >
        {dictionary.quote.viewRoute}
      </a>
    </section>
  );
}
