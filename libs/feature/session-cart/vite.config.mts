import { createLibTestConfig } from '../../../vitest.base.mts';

export default createLibTestConfig({
  projectRoot: import.meta.dirname,
  name: 'feature-session-cart',
  angularTemplates: true,
});
