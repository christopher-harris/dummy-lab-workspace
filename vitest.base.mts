/// <reference types='vitest' />
import { relative } from 'node:path';

import angular from '@analogjs/vite-plugin-angular';
import { defineConfig, type PluginOption, type UserConfig } from 'vite';

const workspaceRoot = import.meta.dirname;

export interface LibTestConfigOptions {
  /** Pass `import.meta.dirname` from the library's own vite.config.mts. */
  projectRoot: string;
  /** Nx project name; shows up as the label in Vitest output. */
  name: string;
  /**
   * Opt in to the Analog Angular compiler plugin. Only needed by libraries
   * that declare components with templates — none of the data-access libs do.
   *
   * Leave it off where you can: the plugin's transform strips the source maps
   * that the coverage providers rely on, so every file a spec does not import
   * silently reports as 0/0 instead of 0%. That turns any coverage threshold
   * into a no-op.
   */
  angularTemplates?: boolean;
  /**
   * Minimum coverage this library must hold, as a percentage. Ratchet these
   * up as real tests land — never down to make a red build green.
   */
  coverageThreshold?: number;
}

/**
 * Shared Vitest setup for the libraries in this workspace.
 *
 * Every lib config used to be a near-identical 30-line copy; the only real
 * differences are the project name, its location, and its coverage floor.
 */
export function createLibTestConfig({
  projectRoot,
  name,
  angularTemplates = false,
  coverageThreshold = 0,
}: LibTestConfigOptions): UserConfig {
  const fromRoot = relative(workspaceRoot, projectRoot);
  const toRoot = relative(projectRoot, workspaceRoot);

  return defineConfig({
    root: projectRoot,
    cacheDir: `${toRoot}/node_modules/.vite/${fromRoot}`,
    // Vite 8 resolves tsconfig `paths` natively, so the `@dummy-lab/*` imports
    // work without vite-tsconfig-paths.
    resolve: { tsconfigPaths: true },
    plugins: [angularTemplates && angular()].filter(Boolean) as PluginOption[],
    test: {
      name,
      watch: false,
      globals: true,
      environment: 'jsdom',
      include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      setupFiles: ['src/test-setup.ts'],
      reporters: ['default'],
      coverage: {
        provider: 'v8',
        reportsDirectory: `${toRoot}/coverage/${fromRoot}`,
        reporter: ['text-summary', 'lcov'],
        // Listing sources explicitly is what pulls files a spec never imported
        // into the report. Without it an untested library reports "Unknown%"
        // and sails past any threshold.
        include: ['src/**/*.ts'],
        exclude: [
          'src/**/*.spec.ts',
          'src/**/*.test.ts',
          'src/test-setup.ts',
          'src/index.ts',
        ],
        thresholds: {
          statements: coverageThreshold,
          branches: coverageThreshold,
          functions: coverageThreshold,
          lines: coverageThreshold,
        },
      },
    },
  }) as UserConfig;
}
