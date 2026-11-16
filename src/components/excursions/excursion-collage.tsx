import Image from "next/image";
import {
  EXCURSION_COLLAGE_PHOTO_COUNT,
  excursionLogoSrc,
  hasExcursionCollage,
  type ExcursionLogoVariant,
} from "@/lib/content/managed-excursion";

type ExcursionCollageProps = {
  images: string[];
  logoVariant: ExcursionLogoVariant;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** Use plain img for object-URL previews in the staff dialog. */
  unoptimized?: boolean;
};

export function ExcursionCollage({
  images,
  logoVariant,
  alt,
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 28vw, (min-width: 640px) 35vw, 90vw",
  unoptimized = false,
}: ExcursionCollageProps) {
  const tiles = images.slice(0, EXCURSION_COLLAGE_PHOTO_COUNT);
  const logoSrc = excursionLogoSrc[logoVariant];
  const plateClass =
    logoVariant === "white"
      ? "bg-white shadow-[0_12px_28px_-10px_rgba(0,0,0,0.45)]"
      : "bg-black shadow-[0_12px_28px_-10px_rgba(0,0,0,0.65)]";

  if (!hasExcursionCollage(tiles)) {
    const src = tiles[0];
    if (!src) {
      return <div className={`bg-[#242426] ${className}`} />;
    }
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {unoptimized ? (
          // eslint-disable-next-line @next/next/no-img-element -- object URLs in staff preview
          <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover"
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 bg-night">
        {tiles.map((src, index) => (
          <div key={`${src}-${index}`} className="relative min-h-0 overflow-hidden">
            {unoptimized ? (
              // eslint-disable-next-line @next/next/no-img-element -- object URLs in staff preview
              <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <Image
                src={src}
                alt=""
                fill
                priority={priority && index < 2}
                sizes={sizes}
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3">
        <div
          className={`flex w-[42%] max-w-[9.5rem] flex-col items-center rounded-xl px-2.5 py-2 sm:rounded-2xl sm:px-3 sm:py-2.5 ${plateClass}`}
        >
          {unoptimized ? (
            // eslint-disable-next-line @next/next/no-img-element -- staff preview
            <img src={logoSrc} alt="Berro Travel" className="h-auto w-full object-contain" />
          ) : (
            <Image
              src={logoSrc}
              alt="Berro Travel"
              width={352}
              height={112}
              className="h-auto w-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}
