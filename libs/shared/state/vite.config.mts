import { createLibTestConfig } from '../../../vitest.base.mts';

export default createLibTestConfig({
  projectRoot: import.meta.dirname,
  name: 'state',
  // This lib's spec declares an inline @Component fixture, so it needs the
  // Angular template compiler.
  angularTemplates: true,
  coverageThreshold: 70,
});
