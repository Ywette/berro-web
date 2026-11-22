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
    <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
        <div>
          <p className="text-base font-medium leading-7 text-ivory">{dictionary.about.lead}</p>
        </div>
        <div>
          <div className="space-y-4 text-sm leading-7 text-mist">
            {dictionary.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-6 text-base font-medium leading-7 text-ivory">{dictionary.about.closing}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/#book"
              className="order-button text-base sm:text-xl"
            >
              {dictionary.nav.getOffer}
            </Link>
            <Link
              href="/autoparks"
              className="rounded-full border border-white/25 px-5 py-2.5 text-sm text-ivory hover:border-white/60"
            >
              {dictionary.about.viewFleet}
            </Link>
          </div>
        </div>
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
