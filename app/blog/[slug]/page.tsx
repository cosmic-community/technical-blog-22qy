import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MarkdownContent from '@/components/MarkdownContent';
import PostCard from '@/components/PostCard';
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/cosmic';
import { formatDate, formatReadingTime } from '@/lib/utils';

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Post not found' };
  }

  const description = post.metadata?.excerpt || undefined;
  const image = post.metadata?.cover_image?.imgix_url;

  return {
    title: post.title,
    description,
    alternates: post.metadata?.canonical_url ? { canonical: post.metadata.canonical_url } : undefined,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      images: image ? [{ url: `${image}?w=1200&h=630&fit=crop&auto=format,compress` }] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = await getRelatedPosts(post, 2);
  const author = post.metadata?.author;
  const category = post.metadata?.category;
  const coverImage = post.metadata?.cover_image?.imgix_url;
  const date = formatDate(post.metadata?.published_date || post.created_at);
  const readingTime = formatReadingTime(post.metadata?.reading_time);
  const tags = post.metadata?.tags || [];

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link
        href="/blog"
        className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        &larr; Back to blog
      </Link>

      <header className="mt-8">
        {category?.title ? (
          <span
            className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: 'hsl(var(--color-accent) / 0.12)',
              color: 'hsl(var(--color-accent))',
            }}
          >
            {category.title}
          </span>
        ) : null}

        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100">
          {post.title}
        </h1>

        {post.metadata?.excerpt ? (
          <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            {post.metadata.excerpt}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-gray-200 pb-6 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          {author?.title ? <span className="font-medium text-gray-700 dark:text-gray-300">{author.title}</span> : null}
          {author?.metadata?.role ? <span>{author.metadata.role}</span> : null}
          {date ? <span aria-hidden="true">&middot;</span> : null}
          {date ? <time>{date}</time> : null}
          {readingTime ? <span aria-hidden="true">&middot;</span> : null}
          {readingTime ? <span>{readingTime}</span> : null}
        </div>
      </header>

      {coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${coverImage}?w=1600&h=800&fit=crop&auto=format,compress`}
          alt={post.title}
          width={1600}
          height={800}
          className="mt-10 w-full rounded-xl object-cover"
        />
      ) : null}

      <div className="mt-10">
        <MarkdownContent content={post.metadata?.content || post.content || ''} />
      </div>

      {tags.length > 0 ? (
        <div className="mt-12 flex flex-wrap gap-2 border-t border-gray-200 pt-8 dark:border-gray-800">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Related posts
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
