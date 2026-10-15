import { createLibTestConfig } from '../../../vitest.base.mts';

export default createLibTestConfig({
  projectRoot: import.meta.dirname,
  name: 'feature-content-blocks',
  // The data-bound blocks are components with templates, so the Analog
  // compiler plugin has to be on — see `vitest.base.mts` for what it costs.
  angularTemplates: true,
});
