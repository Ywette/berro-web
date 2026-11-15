import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function TrustInfoSection() {
  const dictionary = await getDictionary();
  const items = [
    {
      title: dictionary.hero.trustComfort,
      icon: <BusIcon />,
    },
    {
      title: dictionary.hero.trustRoutes,
      icon: <RouteIcon />,
    },
    {
      title: dictionary.hero.trustService,
      icon: <ServiceIcon />,
    },
  ] as const;

  return (
    <section aria-label={dictionary.hero.support} className="bg-night">
      <div className="mx-auto grid max-w-7xl gap-3 px-5 py-8 sm:grid-cols-3 sm:gap-4 sm:py-10">
        {items.map((item) => (
          <article
            key={item.title}
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#141418] px-5 py-5"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-burgundy/20 text-champagne">
              {item.icon}
            </span>
            <h2 className="text-sm font-medium tracking-wide text-ivory sm:text-[15px]">{item.title}</h2>
          </article>
        ))}
      </div>
    </section>
  );
}

function BusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="13" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 11h16M8 17.5v1.5M16 17.5v1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="8" cy="14.5" r="1" fill="currentColor" />
      <circle cx="16" cy="14.5" r="1" fill="currentColor" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="17.5" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8.2 7.8c2.4 0 3.4 1.4 4.3 3.2.9 1.8 1.9 3.2 4.3 3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ServiceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 3.5 13.7 8h4.8l-3.9 2.9 1.5 4.6L12 13.2 7.9 15.5l1.5-4.6L5.5 8h4.8L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
