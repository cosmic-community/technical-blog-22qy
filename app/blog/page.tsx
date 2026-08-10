import type { Metadata } from 'next';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/lib/cosmic';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog',
  description: 'All engineering posts on systems, infrastructure, and machine learning.',
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">
        All posts
      </h1>
      <p className="mt-3 text-gray-600 dark:text-gray-400">
        {posts.length} {posts.length === 1 ? 'post' : 'posts'} published.
      </p>

      {posts.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No published posts yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
