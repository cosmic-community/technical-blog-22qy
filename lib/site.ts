/**
 * Site-wide constants used for SEO, Open Graph, and structured data.
 *
 * `siteUrl()` must return an absolute origin: social crawlers (Facebook,
 * X/Twitter, LinkedIn, Slack) will not follow relative image or URL paths,
 * so a localhost fallback silently breaks every share preview in production.
 */

const FALLBACK_SITE_URL = 'https://tech-blog.cosmic.site';

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.trim()) {
    const trimmed = explicit.trim();
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return stripTrailingSlash(withProtocol);
  }

  // Vercel exposes the deployment host (no protocol) at build/run time.
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (vercel && vercel.trim()) {
    return stripTrailingSlash(`https://${vercel.trim()}`);
  }

  return FALLBACK_SITE_URL;
}

export function absoluteUrl(path = '/'): string {
  const base = siteUrl();
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export const SITE = {
  name: 'Technical Blog',
  shortName: 'Technical Blog',
  description:
    'Engineering deep dives on AI code review, distributed systems, and the measured behaviour of frontier models — with the data and traces behind each claim.',
  locale: 'en_US',
  /** Site-wide fallback share image, used when a post has no cover image. */
  defaultOgImage:
    'https://imgix.cosmicjs.com/24ecea60-948a-11f1-b939-859296e70f19-generated-1786345647025.jpg',
  twitterHandle: '@cosmicjs',
  keywords: [
    'engineering blog',
    'AI code review',
    'large language models',
    'distributed systems',
    'developer tools',
    'software architecture',
  ],
} as const;
