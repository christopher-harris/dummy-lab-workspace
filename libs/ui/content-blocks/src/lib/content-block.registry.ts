import type { ContentBlockKey } from '@dummy-lab/shared-models';

import type { ContentBlockEntry, ContentBlockRegistry } from './content-block.types';
import { HERO_BLOCK_REGISTRY } from './hero/hero-block.registry';

/**
 * Every renderable content block, keyed by Strapi component uid.
 *
 * An object rather than an array: lookup is a property read instead of a scan,
 * and the mapped type makes exhaustiveness the compiler's problem.
 */
export const CONTENT_BLOCK_REGISTRY: ContentBlockRegistry = {
  ...HERO_BLOCK_REGISTRY,
};

/**
 * Resolves a block entry from a key that came off the wire.
 *
 * Typed as `string` rather than `ContentBlockKey` on purpose: the compile-time
 * union says what this build knows about, but Strapi is free to return a block
 * added after this bundle shipped. `null` is that case, and the caller decides
 * whether an unknown block is skipped or surfaced.
 */
export function getContentBlockEntry(
  key: string | null | undefined,
): ContentBlockEntry | null {
  if (!key || !Object.prototype.hasOwnProperty.call(CONTENT_BLOCK_REGISTRY, key)) {
    return null;
  }

  return CONTENT_BLOCK_REGISTRY[key as ContentBlockKey];
}
