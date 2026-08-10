'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
];

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    try {
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch {
      /* localStorage unavailable */
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: 'hsl(var(--color-accent))' }}
          />
          Technical Blog
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="ml-1 rounded-md border border-gray-200 p-2 text-gray-600 transition-colors hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {mounted && isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
