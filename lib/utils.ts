import { isValidElement, type ReactNode } from 'react';
import type { Heading } from '@/types';

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