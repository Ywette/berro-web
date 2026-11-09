import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlanTripActions } from "@/components/blog/plan-trip-actions";
import { blogPosts, findPost, type BlogBlock } from "@/lib/content/blog";
import { formatPostDate } from "@/lib/content/format-date";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const [{ slug }, dictionary] = await Promise.all([params, getDictionary()]);
  const post = findPost(slug);
  return { title: post ? post.title[dictionary.locale] : dictionary.nav.blog };
}

export default function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-[60vh] max-w-3xl px-5 py-12" />}>
      <BlogPost params={params} />
    </Suspense>
  );
}

async function BlogPost({ params }: { params: PageProps<"/blog/[slug]">["params"] }) {
  const [{ slug }, dictionary] = await Promise.all([params, getDictionary()]);
  const post = findPost(slug);

  if (!post) {
    notFound();
  }

  const locale = dictionary.locale;

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/blog" className="text-sm text-mist hover:text-white">
        ← {dictionary.blog.back}
      </Link>
      <time dateTime={post.date} className="mt-6 block text-xs text-mist">
        {formatPostDate(post.date, locale)}
      </time>
      <h1 className="mt-2 font-serif text-4xl leading-tight tracking-wide sm:text-5xl">
        {post.title[locale]}
      </h1>
      <div className="relative mt-8 h-72 overflow-hidden rounded-2xl">
        <Image
          src={post.image}
          alt={post.title[locale]}
          fill
          priority
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="mt-8 grid gap-5 text-base leading-8 text-ivory/90">
        {post.body[locale].map((block, index) => (
          <PostBlock key={index} block={block} />
        ))}
      </div>
      {post.planTripActions ? <PlanTripActions /> : null}
    </article>
  );
}

function PostBlock({ block }: { block: BlogBlock }) {
  if (typeof block === "string") {
    return <p>{block}</p>;
  }
  if ("heading" in block) {
    return <h2 className="mt-4 font-serif text-2xl leading-snug tracking-wide text-ivory">{block.heading}</h2>;
  }
  if ("lead" in block) {
    return <p className="text-xl leading-8 font-semibold text-ivory">{block.lead}</p>;
  }
  if ("note" in block) {
    return <p className="border-l-2 border-burgundy pl-4 text-mist italic">{block.note}</p>;
  }
  return (
    <p>
      {block.before ? `${block.before} ` : null}
      <strong className="font-semibold text-ivory">{block.strong}</strong>
      {block.text ? ` ${block.text}` : null}
    </p>
  );
}
