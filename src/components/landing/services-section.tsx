import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/get-dictionary";

const rentalImage = "/fleet/gallery/rental-fleet-riverside.jpg";
const toursImage = "/fleet/gallery/excursions-riga-old-town.jpg";

export async function ServicesSection() {
  const dictionary = await getDictionary();
  const { services } = dictionary;

  return (
    <section id="services" className="scroll-mt-[var(--site-header-height)] border-t border-white/8">
      <div className="mx-auto max-w-7xl px-5 py-14">
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
      <div className="grid h-full flex-1 sm:grid-cols-[minmax(0,1.15fr)_minmax(9rem,0.85fr)]">
        <div className="flex h-full min-h-0 flex-col px-6 py-7 sm:px-7 sm:py-8">
          <h3 className="text-lg font-medium tracking-wide text-ivory sm:text-xl">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-mist">{body}</p>
          <ul className="mt-4 grid gap-2">
            {features.map((feature) => (
              <li key={feature} className="text-sm text-mist">
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-7">
            <Link
              href={href}
              className={
                variant === "primary"
                  ? "inline-flex h-11 w-full items-center justify-center rounded-full bg-ivory px-5 text-sm font-semibold text-night transition hover:bg-white sm:w-auto"
                  : "inline-flex h-11 w-full items-center justify-center rounded-full border border-white/35 px-5 text-sm font-semibold text-ivory transition hover:border-white/60 hover:bg-white/5 sm:w-auto"
              }
            >
              {cta}
            </Link>
          </div>
        </div>

        <div className="relative min-h-44 overflow-hidden sm:h-full sm:min-h-0">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 18vw, (min-width: 640px) 35vw, 90vw"
            className="object-cover"
            style={{ objectPosition: "center center" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#141418] via-[#141418]/70 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#141418] via-[#141418]/70 to-transparent"
          />
        </div>
      </div>
    </article>
  );
}
