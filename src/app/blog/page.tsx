import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/lib/content/blog";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatPostDate } from "@/lib/content/format-date";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: dictionary.nav.blog };
}

export default async function BlogPage() {
  const dictionary = await getDictionary();
  const locale = dictionary.locale;

  return (
    <section className="mx-auto w-full px-5 py-12 md:w-[75vw] md:px-0">
      <div className="mb-8 max-w-3xl">
        <p className="text-xs tracking-[0.22em] text-burgundy uppercase">{dictionary.blog.kicker}</p>
        <h1 className="mt-3 font-serif text-5xl tracking-wide">{dictionary.blog.title}</h1>
        <p className="mt-3 text-sm leading-6 text-mist">{dictionary.blog.intro}</p>
      </div>

      <div className="flex flex-col gap-6">
        {blogPosts.map((post, index) => {
          const imageRight = index % 2 === 1;

          return (
            <article
              key={post.slug}
              className="grid overflow-hidden rounded-2xl border border-white/10 bg-card md:grid-cols-2"
            >
              <Link
                href={`/blog/${post.slug}`}
                tabIndex={-1}
                aria-hidden="true"
                className={`relative block h-56 md:h-auto md:min-h-80 ${imageRight ? "md:order-2" : ""}`}
              >
                <Image
                  src={post.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 38vw, 100vw"
                  className="object-cover"
                />
              </Link>
              <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
                <time dateTime={post.date} className="text-xs text-mist">
                  {formatPostDate(post.date, locale)}
                </time>
                <h2 className="font-serif text-3xl leading-tight tracking-wide">
                  <Link href={`/blog/${post.slug}`} className="hover:text-white">
                    {post.title[locale]}
                  </Link>
                </h2>
                <p className="text-sm leading-7 text-mist">{post.excerpt[locale]}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="self-start text-sm text-ivory underline decoration-burgundy underline-offset-4 hover:text-white"
                >
                  {dictionary.blog.readMore}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
