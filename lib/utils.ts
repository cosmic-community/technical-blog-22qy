import { isValidElement, type ReactNode } from 'react';
import type { CosmicFile, Heading } from '@/types';
import { SITE } from '@/lib/site';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugifyTag(tag: string): string {
  return tag.toLowerCase().trim().replace(/\s+/g, '-');
}

const COSMIC_IMGIX_HOST = 'https://imgix.cosmicjs.com';

/**
 * Resolve a Cosmic file metafield to an absolute URL.
 *
 * Cosmic returns file metafields in one of two shapes:
 *   - a media object: { url, imgix_url }
 *   - a bare filename string: "e2632540-...-photo.jpeg"
 *
 * This bucket currently returns bare strings for `cover_image` and `avatar`,
 * which is why reading `.imgix_url` directly yields `undefined`. Always route
 * file metafields through this helper.
 */
export function resolveMediaUrl(file?: CosmicFile | null): string | undefined {
  if (!file) return undefined;

  if (typeof file === 'string') {
    const trimmed = file.trim();
    if (!trimmed) return undefined;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `${COSMIC_IMGIX_HOST}/${trimmed.replace(/^\/+/, '')}`;
  }

  if (typeof file === 'object') {
    const candidate = file.imgix_url || file.url;
    if (candidate && candidate.trim()) return candidate.trim();
  }

  return undefined;
}

/**
 * Build an imgix-transformed URL at exact Open Graph dimensions (1200x630),
 * the size X, Facebook, LinkedIn and Slack all render best. Falls back to the
 * site-wide share image so a post is never shared without a preview card.
 */
export function ogImageUrl(file?: CosmicFile | null): string {
  const resolved = resolveMediaUrl(file) ?? SITE.defaultOgImage;
  const separator = resolved.includes('?') ? '&' : '?';
  return `${resolved}${separator}w=1200&h=630&fit=crop&auto=format,compress`;
}

/** Transform a Cosmic image to arbitrary dimensions for on-page rendering. */
export function imageUrl(
  file: CosmicFile | null | undefined,
  width: number,
  height: number
): string | undefined {
  const resolved = resolveMediaUrl(file);
  if (!resolved) return undefined;
  const separator = resolved.includes('?') ? '&' : '?';
  return `${resolved}${separator}w=${width}&h=${height}&fit=crop&auto=format,compress`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** ISO-8601 date for structured data and article:published_time. */
export function toIsoDate(dateString?: string): string | undefined {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

/**
 * Clamp a description to a length search engines and social cards will show
 * without truncating mid-word (~160 chars is the practical meta limit).
 */
export function truncateForMeta(text: string | undefined, maxLength = 160): string {
  if (!text) return '';
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;

  const clipped = normalized.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(' ');
  const safe = lastSpace > maxLength * 0.6 ? clipped.slice(0, lastSpace) : clipped;
  return `${safe.replace(/[.,;:!?-]+$/, '')}…`;
}

/** Normalize an X/Twitter handle to @name form. */
export function normalizeHandle(handle?: string): string | undefined {
  if (!handle) return undefined;
  const trimmed = handle.trim().replace(/^@+/, '');
  if (!trimmed) return undefined;
  return `@${trimmed}`;
}

export function formatReadingTime(value: unknown): string {
  if (value === undefined || value === null || value === '') return '';

  if (typeof value === 'number') {
    return `${value} min read`;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && String(num) === trimmed) {
      return `${num} min read`;
    }
    return trimmed.toLowerCase().includes('read') ? trimmed : `${trimmed} min read`;
  }

  return '';
}

export function hexToRgba(hex: string, alpha: number): string {
  let sanitized = hex.replace('#', '');
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const int = parseInt(sanitized, 16);
  if (isNaN(int) || sanitized.length !== 6) {
    return `rgba(100, 116, 139, ${alpha})`;
  }

  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function extractHeadings(markdown: string): Heading[] {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const headings: Heading[] = [];

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.*)/);
    const h3Match = line.match(/^###\s+(.*)/);

    if (h2Match && h2Match[1]) {
      const text = h2Match[1].replace(/[#*`]/g, '').trim();
      if (text) headings.push({ id: slugify(text), text, level: 2 });
    } else if (h3Match && h3Match[1]) {
      const text = h3Match[1].replace(/[#*`]/g, '').trim();
      if (text) headings.push({ id: slugify(text), text, level: 3 });
    }
  }

  return headings;
}

export function childrenToText(children: ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join('');
  if (isValidElement(children)) {
    const props = children.props as { children?: ReactNode };
    return childrenToText(props.children);
  }
  return '';
}
