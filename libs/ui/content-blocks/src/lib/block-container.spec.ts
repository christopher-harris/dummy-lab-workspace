import type { BlockContainerWidth } from '@dummy-lab/shared-models';

import { BLOCK_CONTAINER_CLASS, blockContainerClass } from './block-container';

const WIDTHS: readonly BlockContainerWidth[] = [
  'full',
  'contained',
  'content-contained',
];

describe('BLOCK_CONTAINER_CLASS', () => {
  it('covers every width in the vocabulary', () => {
    for (const width of WIDTHS) {
      expect(BLOCK_CONTAINER_CLASS[width]).toBeTruthy();
    }
  });

  it('gives each width a distinct class, so the setting is observable', () => {
    const classes = WIDTHS.map((width) => BLOCK_CONTAINER_CLASS[width]);

    expect(new Set(classes).size).toBe(classes.length);
  });

  it('leaves `full` unconstrained', () => {
    expect(BLOCK_CONTAINER_CLASS.full).toBe('max-w-none');
  });

  it('centres the two constrained widths', () => {
    expect(BLOCK_CONTAINER_CLASS.contained).toContain('mx-auto');
    expect(BLOCK_CONTAINER_CLASS['content-contained']).toContain('mx-auto');
  });

  it('spells every class out in full, because Tailwind scans source text', () => {
    // A class assembled by concatenation is invisible to the v4 scanner and
    // would silently never be generated.
    for (const width of WIDTHS) {
      expect(BLOCK_CONTAINER_CLASS[width]).toMatch(/^max-w-[\w-]+( mx-auto)?$/);
    }
  });
});

describe('blockContainerClass', () => {
  it('reads the class off a block settings object', () => {
    expect(blockContainerClass({ containerWidth: 'content-contained' })).toBe(
      BLOCK_CONTAINER_CLASS['content-contained'],
    );
  });
});
