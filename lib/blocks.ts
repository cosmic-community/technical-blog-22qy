import 'server-only';

/**
 * Content Block definitions for the bucket.
 *
 * Rich text fields reference reusable blocks with a `{{name /}}` token. The
 * token only carries the block name, so the definitions have to be fetched
 * separately and handed to the renderer to resolve against.
 *
 * Blocks are cached on the Bucket, so this is a cheap call and the same result
 * can be reused across many Objects.
 *
 * See https://www.cosmicjs.com/docs/api/rich-text
 */
export interface CosmicBlock {
  name: string;
  title?: string;
  content: string;
  editor?: 'rich-text' | 'plain' | 'html';
}

/**
 * Fetched via the REST endpoint rather than the SDK so this does not depend on
 * a particular @cosmicjs/sdk minor version exposing a blocks helper.
 */
export async function getBlocks(): Promise<CosmicBlock[]> {
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG;
  const readKey = process.env.COSMIC_READ_KEY;

  if (!bucketSlug || !readKey) {
    return [];
  }

  const url = `https://api.cosmicjs.com/v3/buckets/${bucketSlug}/blocks?read_key=${encodeURIComponent(
    readKey
  )}`;

  try {
    const response = await fetch(url, {
      // Blocks change rarely and are bucket-cached; match the page revalidate
      // window so edits in the dashboard still flow through.
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return [];
    }

    const data: unknown = await response.json();

    if (
      typeof data === 'object' &&
      data !== null &&
      'blocks' in data &&
      Array.isArray((data as { blocks: unknown }).blocks)
    ) {
      return (data as { blocks: CosmicBlock[] }).blocks;
    }

    return [];
  } catch (error) {
    // A missing block definition should degrade to unresolved text, never take
    // down the whole post page.
    return [];
  }
}
