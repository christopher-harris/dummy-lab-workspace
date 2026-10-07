import type { StrapiMedia } from '@dummy-lab/shared-models';

/**
 * Minimal media object for block specs.
 *
 * Not exported from the library barrel: blocks are the public surface, their
 * test fixtures are not.
 */
export const testMedia = (name: string): StrapiMedia => ({
  id: 1,
  documentId: name,
  name,
  alternativeText: `${name} alt`,
  caption: null,
  width: 100,
  height: 100,
  mime: 'image/jpeg',
  url: `/uploads/${name}.jpg`,
  formats: null,
});

export const TEST_RUNTIME_CONFIG = {
  environment: 'local',
  apiBaseUrl: 'https://dummyjson.com',
  cmsBaseUrl: 'http://localhost:1337',
  features: { experimentalCatalog: false },
} as const;

/** Every width in the vocabulary, for table-driven container assertions. */
export const CONTAINER_WIDTHS = [
  'full',
  'contained',
  'content-contained',
] as const;
