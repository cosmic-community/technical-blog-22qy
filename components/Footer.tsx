import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Technical Blog</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Engineering deep dives on systems, infrastructure, and machine learning.
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="transition-colors hover:text-gray-900 dark:hover:text-gray-100">
            Home
          </Link>
          <Link href="/blog" className="transition-colors hover:text-gray-900 dark:hover:text-gray-100">
            Blog
          </Link>
          <span>&copy; {year}</span>
        </div>
      </div>
    </footer>
  );
}
