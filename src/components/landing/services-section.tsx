import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const rentalImage = "/fleet/gallery/rental-fleet-riverside-v2.jpg";
const toursImage = "/fleet/gallery/excursions-riga-old-town-v2.jpg";

export async function ServicesSection() {
  const dictionary = await getDictionary();
  const { services } = dictionary;

  return (
    <section
      id="services"
      className="flex min-h-[calc(100svh-var(--site-header-height))] scroll-mt-[var(--site-header-height)] border-t border-white/8"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col justify-center px-5 py-10 sm:py-12">
        <div>
          <h2 className="max-w-3xl text-2xl font-medium text-ivory sm:text-3xl">
            {services.headline}
          </h2>
          <div className="mt-5 max-w-3xl space-y-4 text-sm leading-7 text-mist sm:text-[15px]">
            {services.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="mt-10 grid items-stretch gap-4 lg:grid-cols-2">
          <ServiceCard
            title={services.rental.title}
            body={services.rental.body}
            cta={services.rental.cta}
            href="/#book"
            image={rentalImage}
            imageAlt={services.rental.imageAlt}
            features={services.rental.features}
            variant="primary"
          />
          <ServiceCard
            title={services.tours.title}
            body={services.tours.body}
            cta={services.tours.cta}
            href="/excursions"
            image={toursImage}
            imageAlt={services.tours.imageAlt}
            features={services.tours.features}
            variant="secondary"
          />
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  title,
  body,
  cta,
  href,
  image,
  imageAlt,
  features,
  variant,
}: {
  title: string;
  body: string;
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
  features: readonly string[];
  variant: "primary" | "secondary";
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141418]">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0c0c0f] sm:aspect-[16/9]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          unoptimized
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="object-contain object-center"
        />
      </div>

      <div className="grid flex-1 gap-6 px-5 py-6 sm:grid-cols-[minmax(0,1.35fr)_minmax(8.5rem,0.75fr)] sm:gap-7 sm:px-6 sm:py-7">
        <div className="flex min-h-0 flex-col">
          <h3 className="text-lg font-medium tracking-wide text-ivory sm:text-xl">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-mist">{body}</p>
          <div className="mt-auto pt-6">
            <Link
              href={href}
              className={
                variant === "primary"
                  ? "order-button w-full sm:w-auto"
                  : "inline-flex h-11 w-full items-center justify-center rounded-full border border-white/35 px-5 text-sm font-semibold text-ivory transition hover:border-white/60 hover:bg-white/5 sm:w-auto"
              }
            >
              {cta}
            </Link>
          </div>
        </div>

        <ul className="grid gap-3 content-start">
          {features.map((feature, index) => (
            <li
              key={feature}
              className="flex items-center gap-2.5 text-sm leading-5 text-ivory/90"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center text-champagne">
                {featureIcon(variant, index)}
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function featureIcon(variant: "primary" | "secondary", index: number) {
  const icons =
    variant === "primary"
      ? [<GroupsIcon key="groups" />, <BusinessIcon key="business" />, <EventsIcon key="events" />]
      : [<NatureIcon key="nature" />, <CultureIcon key="culture" />, <ThemeIcon key="theme" />];
  return icons[index] ?? icons[0];
}

function GroupsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3ZM8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3ZM8.2 13.5c-2.4 0-4.7 1.2-4.7 3.2V18h9.4v-1.3c0-2-2.3-3.2-4.7-3.2ZM16.1 13.5c-.4 0-.8 0-1.2.1 1.2.8 2 2 2 3.3V18h5v-1.3c0-2-2.2-3.2-4.8-3.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BusinessIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M8 7V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8V7M4 10h16M6 7h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EventsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M8 3v3M16 3v3M4.5 9h15M6 6h12a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 18 20H6a1.5 1.5 0 0 1-1.5-1.5v-11A1.5 1.5 0 0 1 6 6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 13h.01M12 13h.01M15 13h.01M9 16h.01M12 16h.01"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NatureIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M12 21V11M12 11c-2.8-1.2-5.5.2-7 2.5 3.2.4 5.3-.2 7-2.5ZM12 11c2.8-1.2 5.5.2 7 2.5-3.2.4-5.3-.2-7-2.5ZM12 14c-1.8-3.5-1-7.2 1.5-9.5C11 6.8 9.8 10 12 14Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CultureIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M4 20h16M6 20V9l6-4 6 4v11M10 20v-5h4v5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12.5h.01M14.5 12.5h.01"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ThemeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M12 3.5 13.8 9H19l-4.2 3.2L16.6 18 12 14.8 7.4 18l1.8-5.8L5 9h5.2L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
