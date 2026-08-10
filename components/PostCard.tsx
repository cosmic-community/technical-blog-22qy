import Link from 'next/link';
import type { Post } from '@/types';
import { formatDate, formatReadingTime } from '@/lib/utils';

export default function PostCard({ post }: { post: Post }) {
  const coverImage = post.metadata?.cover_image?.imgix_url;
  const category = post.metadata?.category;
  const author = post.metadata?.author;
  const date = formatDate(post.metadata?.published_date || post.created_at);
  const readingTime = formatReadingTime(post.metadata?.reading_time);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-gray-700">
      {coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${coverImage}?w=800&h=420&fit=crop&auto=format,compress`}
          alt={post.title}
          width={800}
          height={420}
          loading="lazy"
          className="h-44 w-full object-cover"
        />
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        {category?.title ? (
          <span
            className="mb-3 inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              backgroundColor: 'hsl(var(--color-accent) / 0.12)',
              color: 'hsl(var(--color-accent))',
            }}
          >
            {category.title}
          </span>
        ) : null}

        <h2 className="text-lg font-semibold leading-snug tracking-tight text-gray-900 dark:text-gray-100">
          <Link href={`/blog/${post.slug}`} className="before:absolute before:inset-0">
            {post.title}
          </Link>
        </h2>

        {post.metadata?.excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {post.metadata.excerpt}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-xs text-gray-500 dark:text-gray-400">
          {author?.title ? <span>{author.title}</span> : null}
          {author?.title && date ? <span aria-hidden="true">&middot;</span> : null}
          {date ? <time>{date}</time> : null}
          {readingTime ? <span aria-hidden="true">&middot;</span> : null}
          {readingTime ? <span>{readingTime}</span> : null}
        </div>
      </div>
    </article>
  );
}
