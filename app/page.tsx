import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts, getFeaturedPosts } from '@/lib/cosmic';
import { formatDate, formatReadingTime, imageUrl } from '@/lib/utils';
import { SITE, absoluteUrl } from '@/lib/site';
import type { Post } from '@/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Engineering deep dives',
  description: SITE.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE.name,
    locale: SITE.locale,
    title: `${SITE.name} \u2014 Engineering deep dives`,
    description: SITE.description,
    images: [
      {
        url: SITE.defaultOgImage,
        width: 1200,
        height: 630,
        alt: `${SITE.name} \u2014 engineering deep dives`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} \u2014 Engineering deep dives`,
    description: SITE.description,
    site: SITE.twitterHandle,
    creator: SITE.twitterHandle,
    images: [SITE.defaultOgImage],
  },
};

async function loadPosts(): Promise<{ posts: Post[]; featured: Post[] }> {
  try {
    const [posts, featured] = await Promise.all([getAllPosts(), getFeaturedPosts()]);
    return { posts, featured };
  } catch (error) {
    return { posts: [], featured: [] };
  }
}

function PostMeta({ post }: { post: Post }) {
  const date = formatDate(post.metadata?.published_date || post.created_at);
  const readingTime = formatReadingTime(post.metadata?.reading_time);
  const authorName = post.metadata?.author?.metadata?.name || post.metadata?.author?.title;

  const parts = [authorName, date, readingTime].filter(Boolean);
  if (parts.length === 0) return null;

  return (
    <p className="text-sm text-gray-500 dark:text-gray-400">{parts.join(' · ')}</p>
  );
}

function PostCard({ post }: { post: Post }) {
  const coverImage = imageUrl(post.metadata?.cover_image, 400, 260);
  const categoryName = post.metadata?.category?.metadata?.name || post.metadata?.category?.title;

  return (
    <article className="group rounded-xl border border-gray-200 p-5 transition-colors hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700">
      <Link href={`/posts/${post.slug}`} className="flex flex-col gap-4 sm:flex-row">
        {coverImage ? (
          <img
            src={coverImage}
            alt={post.title}
            width={200}
            height={130}
            loading="lazy"
            className="h-32 w-full rounded-lg object-cover sm:w-48"
          />
        ) : null}

        <div className="flex-1">
          {categoryName ? (
            <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-wide text-accent">
              {categoryName}
            </span>
          ) : null}
          <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-accent dark:text-gray-50">
            {post.title}
          </h3>
          {post.metadata?.excerpt ? (
            <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {post.metadata.excerpt}
            </p>
          ) : null}
          <PostMeta post={post} />
        </div>
      </Link>
    </article>
  );
}

export default async function HomePage() {
  const { posts, featured } = await loadPosts();
  const leadPost = featured[0] ?? posts[0] ?? null;
  const remainingPosts = leadPost ? posts.filter((post) => post.slug !== leadPost.slug) : posts;
  const leadCoverImage = leadPost ? imageUrl(leadPost.metadata?.cover_image, 1200, 600) : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${absoluteUrl('/')}#website`,
        url: absoluteUrl('/'),
        name: SITE.name,
        description: SITE.description,
        inLanguage: 'en-US',
      },
      {
        '@type': 'Blog',
        '@id': `${absoluteUrl('/')}#blog`,
        url: absoluteUrl('/'),
        name: SITE.name,
        description: SITE.description,
        blogPost: posts.slice(0, 10).map((post) => ({
          '@type': 'BlogPosting',
          headline: post.title,
          url: absoluteUrl(`/posts/${post.slug}`),
          ...(post.metadata?.published_date
            ? { datePublished: post.metadata.published_date }
            : {}),
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mb-12">
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-50">
          Technical Blog
        </h1>
        <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Engineering deep dives on systems, infrastructure, and machine learning.
        </p>
      </section>

      {leadPost ? (
        <section className="mb-14">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Featured
          </h2>
          <Link href={`/posts/${leadPost.slug}`} className="group block">
            {leadCoverImage ? (
              <img
                src={leadCoverImage}
                alt={leadPost.title}
                width={1200}
                height={600}
                className="mb-5 aspect-[2/1] w-full rounded-xl object-cover"
              />
            ) : null}
            <h3 className="mb-3 text-2xl font-bold text-gray-900 group-hover:text-accent sm:text-3xl dark:text-gray-50">
              {leadPost.title}
            </h3>
            {leadPost.metadata?.excerpt ? (
              <p className="mb-3 text-gray-600 dark:text-gray-400">{leadPost.metadata.excerpt}</p>
            ) : null}
            <PostMeta post={leadPost} />
          </Link>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Latest posts
        </h2>

        {remainingPosts.length > 0 ? (
          <div className="grid gap-5">
            {remainingPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {leadPost
              ? 'No other posts yet. Check back soon.'
              : 'No published posts yet. Publish a post in Cosmic and it will appear here.'}
          </p>
        )}
      </section>
    </div>
  );
}
