import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { getAllPosts, getFeaturedPosts } from '@/lib/cosmic';

export const revalidate = 60;

export default async function HomePage() {
  const [posts, featured] = await Promise.all([getAllPosts(), getFeaturedPosts()]);

  const featuredSlugs = new Set(featured.map((post) => post.slug));
  const rest = posts.filter((post) => !featuredSlugs.has(post.slug));

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-100">
          Engineering deep dives
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          In-depth technical writing on systems, infrastructure, and machine learning &mdash;
          written by the people building them.
        </p>
      </section>

      {posts.length === 0 ? (
        <p className="mt-16 rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No published posts yet. Publish a post in Cosmic and it will appear here.
        </p>
      ) : null}

      {featured.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Featured
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {featured.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section className="mt-16">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Latest
            </h2>
            <Link
              href="/blog"
              className="text-sm font-medium"
              style={{ color: 'hsl(var(--color-accent))' }}
            >
              View all &rarr;
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.slice(0, 6).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
