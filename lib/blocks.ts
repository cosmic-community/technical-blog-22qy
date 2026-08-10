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
export type BlockEditor = 'rich-text' | 'plain' | 'html';

/**
 * `editor` is required here on purpose: the renderer's `BlockDefinition`
 * requires it, so allowing `undefined` to flow through would only push the
 * type error to the call site. The API response is normalized in `toBlock`
 * below so this contract always holds.
 */
export interface CosmicBlock {
  name: string;
  title?: string;
  content: string;
  editor: BlockEditor;
}

const BLOCK_EDITORS: readonly BlockEditor[] = ['rich-text', 'plain', 'html'];

function isBlockEditor(value: unknown): value is BlockEditor {
  return typeof value === 'string' && (BLOCK_EDITORS as readonly string[]).includes(value);
}

/**
 * Normalize one raw API block.
 *
 * A missing or unrecognized `editor` falls back to 'rich-text' rather than
 * 'html': treating content of unknown provenance as markdown is the safer
 * default, since it renders as text instead of being injected as raw markup.
 * Returns null for entries missing the fields the renderer needs.
 */
function toBlock(raw: unknown): CosmicBlock | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }

  const candidate = raw as Record<string, unknown>;

  if (typeof candidate.name !== 'string' || typeof candidate.content !== 'string') {
    return null;
  }

  return {
    name: candidate.name,
    title: typeof candidate.title === 'string' ? candidate.title : undefined,
    content: candidate.content,
    editor: isBlockEditor(candidate.editor) ? candidate.editor : 'rich-text',
  };
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
      return (data as { blocks: unknown[] }).blocks
        .map(toBlock)
        .filter((block): block is CosmicBlock => block !== null);
    }

    return [];
  } catch (error) {
    // A missing block definition should degrade to unresolved text, never take
    // down the whole post page.
    return [];
  }
}
