import type { ContentBlockKey } from '@dummy-lab/shared-models';

import {
  CONTENT_BLOCK_REGISTRY,
  getContentBlockEntry,
} from './content-block.registry';

const keys = Object.keys(CONTENT_BLOCK_REGISTRY) as ContentBlockKey[];

describe('CONTENT_BLOCK_REGISTRY', () => {
  it('registers every block the union declares', () => {
    // Exhaustiveness is the mapped type's job and fails the build, not this
    // test. What this asserts is that the object is actually populated — a
    // registry that composed to `{}` would still satisfy the type if every
    // family registry were empty.
    expect(keys.length).toBeGreaterThan(0);
  });

  it('keys every entry by its own uid', () => {
    for (const key of keys) {
      expect(CONTENT_BLOCK_REGISTRY[key].key).toBe(key);
    }
  });

  it('gives every entry a family and a label for a future builder UI', () => {
    for (const key of keys) {
      expect(CONTENT_BLOCK_REGISTRY[key].family).toBeTruthy();
      expect(CONTENT_BLOCK_REGISTRY[key].label).toBeTruthy();
    }
  });
});

describe('getContentBlockEntry', () => {
  it('resolves every registered key', () => {
    for (const key of keys) {
      expect(getContentBlockEntry(key)).toBe(CONTENT_BLOCK_REGISTRY[key]);
    }
  });

  it('returns null for a block type added to Strapi after this bundle shipped', () => {
    expect(getContentBlockEntry('hero.not-built-yet')).toBeNull();
  });

  it('returns null for empty and absent keys', () => {
    expect(getContentBlockEntry('')).toBeNull();
    expect(getContentBlockEntry(null)).toBeNull();
    expect(getContentBlockEntry(undefined)).toBeNull();
  });

  it('does not resolve inherited Object properties', () => {
    // The lookup guards with `hasOwnProperty` rather than a bare `in`; without
    // it, a block named `constructor` or `toString` would resolve to something
    // off `Object.prototype`.
    expect(getContentBlockEntry('constructor')).toBeNull();
    expect(getContentBlockEntry('toString')).toBeNull();
    expect(getContentBlockEntry('__proto__')).toBeNull();
  });
});
