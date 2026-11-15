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
                  ? "inline-flex h-11 w-full items-center justify-center rounded-full bg-ivory px-5 text-sm font-semibold text-night transition hover:bg-white sm:w-auto"
                  : "inline-flex h-11 w-full items-center justify-center rounded-full border border-white/35 px-5 text-sm font-semibold text-ivory transition hover:border-white/60 hover:bg-white/5 sm:w-auto"
              }
            >
              {cta}
            </Link>
          </div>
        </div>

        <ul className="grid gap-2.5 content-start">
          {features.map((feature) => (
            <li
              key={feature}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-sm leading-5 text-ivory/90"
            >
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
