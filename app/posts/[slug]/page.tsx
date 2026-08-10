import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RichText } from '@cosmicjs/rich-text';
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/cosmic';
import { getBlocks } from '@/lib/blocks';
import {
  formatDate,
  formatReadingTime,
  imageUrl,
  normalizeHandle,
  ogImageUrl,
  toIsoDate,
  truncateForMeta,
} from '@/lib/utils';
import { SITE, absoluteUrl } from '@/lib/site';
import type { Post } from '@/types';

export const revalidate = 60;

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

async function loadPost(slug: string): Promise<Post | null> {
  try {
    return await getPostBySlug(slug);
  } catch (error) {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const posts = await getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);

  if (!post) {
    return {
      title: 'Post not found',
      description: 'The post you are looking for could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const description = truncateForMeta(post.metadata?.excerpt || post.title);
  const shareImage = ogImageUrl(post.metadata?.cover_image);
  const postPath = `/posts/${post.slug}`;
  const canonical = post.metadata?.canonical_url || postPath;
  const authorName = post.metadata?.author?.metadata?.name || post.metadata?.author?.title;
  const authorHandle = normalizeHandle(post.metadata?.author?.metadata?.x_handle);
  const published = toIsoDate(post.metadata?.published_date || post.created_at);
  const modified = toIsoDate(post.modified_at) || published;
  const tags = post.metadata?.tags ?? [];
  const categoryName =
    post.metadata?.category?.metadata?.name || post.metadata?.category?.title;

  return {
    title: post.title,
    description,
    keywords: tags.length ? tags : undefined,
    authors: authorName ? [{ name: authorName }] : undefined,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: postPath,
      siteName: SITE.name,
      locale: SITE.locale,
      title: post.title,
      description,
      publishedTime: published,
      modifiedTime: modified,
      authors: authorName ? [authorName] : undefined,
      section: categoryName,
      tags: tags.length ? tags : undefined,
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      site: SITE.twitterHandle,
      creator: authorHandle || SITE.twitterHandle,
      images: [shareImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await loadPost(slug);

  if (!post) {
    notFound();
  }

  const body = post.metadata?.content || post.content || '';
  const coverImage = imageUrl(post.metadata?.cover_image, 1600, 800);
  const categoryName = post.metadata?.category?.metadata?.name || post.metadata?.category?.title;
  const authorName = post.metadata?.author?.metadata?.name || post.metadata?.author?.title;
  const date = formatDate(post.metadata?.published_date || post.created_at);
  const readingTime = formatReadingTime(post.metadata?.reading_time);
  const tags = post.metadata?.tags ?? [];

  const published = toIsoDate(post.metadata?.published_date || post.created_at);
  const modified = toIsoDate(post.modified_at) || published;

  // BlogPosting structured data — drives Google rich results and is read by
  // several social/preview scrapers as a fallback when OG tags are absent.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: truncateForMeta(post.metadata?.excerpt || post.title),
    image: [ogImageUrl(post.metadata?.cover_image)],
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/posts/${post.slug}`),
    },
    author: authorName
      ? {
          '@type': 'Person',
          name: authorName,
          ...(post.metadata?.author?.metadata?.role
            ? { jobTitle: post.metadata.author.metadata.role }
            : {}),
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: {
        '@type': 'ImageObject',
        url: SITE.defaultOgImage,
      },
    },
    ...(categoryName ? { articleSection: categoryName } : {}),
    ...(tags.length ? { keywords: tags.join(', ') } : {}),
  };

  // Block definitions the `{{name /}}` tokens in the body resolve against.
  const blocks = await getBlocks();

  let relatedPosts: Post[] = [];
  try {
    relatedPosts = await getRelatedPosts(post);
  } catch (error) {
    relatedPosts = [];
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/"
        className="mb-8 inline-flex items-center text-sm font-medium text-gray-600 hover:text-accent dark:text-gray-400"
      >
        &larr; Back to all posts
      </Link>

      <header className="mb-8">
        {categoryName ? (
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-accent">
            {categoryName}
          </span>
        ) : null}

        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-50">
          {post.title}
        </h1>

        {post.metadata?.excerpt ? (
          <p className="mb-4 text-lg text-gray-600 dark:text-gray-400">{post.metadata.excerpt}</p>
        ) : null}

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {[authorName, date, readingTime].filter(Boolean).join(' · ')}
        </p>
      </header>

      {coverImage ? (
        <img
          src={coverImage}
          alt={post.title}
          width={1600}
          height={800}
          className="mb-10 aspect-[2/1] w-full rounded-xl object-cover"
        />
      ) : null}

      {body ? (
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <RichText value={body} blocks={blocks} />
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">This post has no content yet.</p>
      )}

      {tags.length > 0 ? (
        <div className="mt-10 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      {relatedPosts.length > 0 ? (
        <section className="mt-16 border-t border-gray-200 pt-8 dark:border-gray-800">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Related posts
          </h2>
          <ul className="space-y-3">
            {relatedPosts.map((related) => (
              <li key={related.id}>
                <Link
                  href={`/posts/${related.slug}`}
                  className="font-medium text-gray-900 hover:text-accent dark:text-gray-100"
                >
                  {related.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
