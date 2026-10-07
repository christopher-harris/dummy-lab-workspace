import { createLibTestConfig } from '../../../vitest.base.mts';

export default createLibTestConfig({
  projectRoot: import.meta.dirname,
  name: 'content-blocks',
  // Unlike the data-access libs, every block here is a component with a real
  // template, so the Analog compiler plugin has to be on. It costs honest
  // coverage reporting for files no spec imports — see `vitest.base.mts`.
  angularTemplates: true,
});
