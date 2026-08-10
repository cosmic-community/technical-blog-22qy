import { createBucketClient } from '@cosmicjs/sdk';
import { slugifyTag } from '@/lib/utils';
import type { Author, Category, Post } from '@/types';

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
});

function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

export function getMetafieldValue(field: unknown): string {
  if (field === null || field === undefined) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'number' || typeof field === 'boolean') return String(field);
  if (typeof field === 'object' && field !== null && 'value' in field) {
    return String((field as { value: unknown }).value);
  }
  if (typeof field === 'object' && field !== null && 'key' in field) {
    return String((field as { key: unknown }).key);
  }
  return '';
}

function sortPostsByDateDesc(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const dateA = new Date(a.metadata?.published_date || a.created_at || '').getTime();
    const dateB = new Date(b.metadata?.published_date || b.created_at || '').getTime();
    return dateB - dateA;
  });
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'posts', status: 'published' })
      .props(['id', 'slug', 'title', 'metadata', 'created_at', 'modified_at'])
      .depth(1);
    return sortPostsByDateDesc(response.objects as Post[]);
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch posts');
  }
}

export async function getFeaturedPosts(): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.metadata?.featured === true);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'posts', slug, status: 'published' })
      .depth(1);
    return response.object as Post;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch post');
  }
}

export async function getPostsByCategoryId(categoryId: string): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.metadata?.category?.id === categoryId);
}

export async function getPostsByAuthorId(authorId: string): Promise<Post[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.metadata?.author?.id === authorId);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await getAllPosts();
  const target = slugifyTag(tag);

  return posts.filter((post) => {
    const tags = post.metadata?.tags;
    if (!tags || tags.length === 0) return false;
    return tags.some((t) => slugifyTag(t) === target);
  });
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'categories' })
      .props(['id', 'slug', 'title', 'metadata']);
    return response.objects as Category[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch categories');
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'categories', slug });
    return response.object as Category;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch category');
  }
}

export async function getAuthors(): Promise<Author[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'authors' })
      .props(['id', 'slug', 'title', 'metadata']);
    return response.objects as Author[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch authors');
  }
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'authors', slug });
    return response.object as Author;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch author');
  }
}

export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const allPosts = await getAllPosts();
  const categoryId = post.metadata?.category?.id;
  const tags = post.metadata?.tags || [];

  const scored = allPosts
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      let score = 0;
      const pCategoryId = p.metadata?.category?.id;
      if (categoryId && pCategoryId === categoryId) {
        score += 2;
      }
      const pTags = p.metadata?.tags || [];
      const sharedTags = pTags.filter((t) => tags.includes(t));
      score += sharedTags.length;
      return { post: p, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry) => entry.post);
}