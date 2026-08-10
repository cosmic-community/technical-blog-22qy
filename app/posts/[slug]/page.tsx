import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/cosmic';
import { formatDate, formatReadingTime } from '@/lib/utils';
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
    return { title: 'Post not found' };
  }

  const description = post.metadata?.excerpt || '';
  const coverImage = post.metadata?.cover_image?.imgix_url;

  return {
    title: post.title,
    description,
    alternates: post.metadata?.canonical_url ? { canonical: post.metadata.canonical_url } : undefined,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      images: coverImage ? [`${coverImage}?w=1200&h=630&fit=crop&auto=format,compress`] : undefined,
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
  const coverImage = post.metadata?.cover_image?.imgix_url;
  const categoryName = post.metadata?.category?.metadata?.name || post.metadata?.category?.title;
  const authorName = post.metadata?.author?.metadata?.name || post.metadata?.author?.title;
  const date = formatDate(post.metadata?.published_date || post.created_at);
  const readingTime = formatReadingTime(post.metadata?.reading_time);
  const tags = post.metadata?.tags ?? [];

  let relatedPosts: Post[] = [];
  try {
    relatedPosts = await getRelatedPosts(post);
  } catch (error) {
    relatedPosts = [];
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
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
          src={`${coverImage}?w=1600&h=800&fit=crop&auto=format,compress`}
          alt={post.title}
          width={1600}
          height={800}
          className="mb-10 aspect-[2/1] w-full rounded-xl object-cover"
        />
      ) : null}

      {body ? (
        <div className="prose prose-gray max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
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
