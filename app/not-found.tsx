import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-4">404</p>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Page not found</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
      >
        Back to home
      </Link>
    </div>
  );
}