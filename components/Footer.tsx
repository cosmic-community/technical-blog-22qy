import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-10 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 dark:text-gray-400">
        <p>&copy; {year} Technical Blog. All rights reserved.</p>
        <p>
          Engineering deep dives on systems, infrastructure, and machine learning.{' '}
          <Link href="/" className="font-medium text-accent hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </footer>
  );
}
