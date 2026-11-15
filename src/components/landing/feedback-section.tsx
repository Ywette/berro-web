import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function FeedbackSection() {
  const dictionary = await getDictionary();
  const { feedback } = dictionary;

  return (
    <section id="feedback" className="scroll-mt-[var(--site-header-height)] border-t border-white/8">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <h2 className="text-2xl font-medium text-ivory sm:text-3xl">{feedback.title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-mist">{feedback.subtitle}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {feedback.items.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col rounded-2xl border border-white/10 px-6 py-7"
            >
              <Stars />
              <blockquote className="mt-4 flex-1 text-sm leading-6 text-ivory/90">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-white/10 pt-4">
                <p className="text-sm font-medium text-ivory">{item.name}</p>
                <p className="mt-0.5 text-xs text-mist">{item.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stars() {
  return (
    <div className="flex gap-1 text-champagne" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <svg key={index} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
          <path d="M10 1.8 12.4 7l5.6.5-4.2 3.7 1.3 5.5L10 13.8 4.9 16.7l1.3-5.5L2 7.5 7.6 7 10 1.8Z" />
        </svg>
      ))}
    </div>
  );
}
