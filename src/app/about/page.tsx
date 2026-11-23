import type { Metadata } from "next";
import Link from "next/link";
import { FleetPhotoGallery } from "@/components/about/fleet-photo-gallery";
import { fleetPhotos } from "@/lib/content/fleet-photos";
import { getDictionary, getLocale } from "@/lib/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.nav.about };
}

export default async function AboutPage() {
  const [dictionary, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <section className="mx-auto max-w-4xl px-5 py-16 lg:py-20">
      <div>
        <h1 className="text-4xl leading-tight text-ivory sm:text-5xl">{dictionary.about.title}</h1>
        <div className="mt-6 space-y-4 text-base/7 text-mist">
          {dictionary.about.lead && <p>{dictionary.about.lead}</p>}
          {dictionary.about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {dictionary.about.closing && <p>{dictionary.about.closing}</p>}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/#book" className="order-button text-xs sm:text-sm">
            {dictionary.nav.getOffer}
          </Link>
          <Link href="/excursions" className="order-button text-xs sm:text-sm">
            {dictionary.about.bookExcursion}
          </Link>
          <Link
            href="/autoparks"
            className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-2.5 text-xs text-ivory hover:border-white/60 sm:text-sm"
          >
            {dictionary.about.viewFleet}
          </Link>
        </div>
      </div>

      <div className="mt-12 aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-night">
        <iframe
          src="https://www.youtube.com/embed/NL9yKteKA74?si=MlVNtEZ8QxVT99Ul"
          title={`${dictionary.nav.about} — Berro Travel`}
          width={560}
          height={315}
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>

      <FleetPhotoGallery
        photos={fleetPhotos}
        locale={locale}
        title={dictionary.about.galleryTitle}
        closeLabel={dictionary.about.galleryClose}
        prevLabel={dictionary.about.galleryPrev}
        nextLabel={dictionary.about.galleryNext}
      />
    </section>
  );
}
