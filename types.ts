export interface CosmicMedia {
  url: string;
  imgix_url: string;
}

/**
 * Cosmic file metafields come back in one of two shapes depending on how the
 * object was fetched and how the value was written:
 *
 *   - a full media object: { url, imgix_url }
 *   - a bare filename string: "e2632540-...-photo.jpeg"
 *
 * The bucket currently returns bare strings for `cover_image` and `avatar`,
 * so every consumer must go through `resolveMediaUrl()` in `lib/utils.ts`
 * rather than reaching for `.imgix_url` directly.
 */
export type CosmicFile = string | CosmicMedia;

export interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, any>;
  type: string;
  status?: string;
  created_at?: string;
  modified_at?: string;
  thumbnail?: string;
}

export interface Author extends CosmicObject {
  type: 'authors';
  metadata: {
    name?: string;
    role?: string;
    bio?: string;
    avatar?: CosmicFile;
    email?: string;
    x_handle?: string;
  };
}

export interface Category extends CosmicObject {
  type: 'categories';
  metadata: {
    name?: string;
    description?: string;
    accent_color?: string;
  };
}

export interface Post extends CosmicObject {
  type: 'posts';
  metadata: {
    excerpt?: string;
    content?: string;
    cover_image?: CosmicFile;
    author?: Author;
    category?: Category;
    tags?: string[];
    reading_time?: number | string;
    published_date?: string;
    featured?: boolean;
    canonical_url?: string;
  };
}

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}
