import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/.wrangler/**',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
            // The Figma export (theme/ts) isn't an Nx project, so its one
            // consumer reaches it by relative path. Depth is from
            // libs/shared/theme/src/lib; it must move if that lib does.
            '^(\\.\\./){5}theme/ts$',
          ],
          // The edge table in docs/ADR/ADR-0001 ("Allowed dependency edges").
          // Change that table first, then this — not the other way round.
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['*'],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:data-access',
                'type:ui',
                'type:util',
              ],
            },
            // A domain never depends on a peer domain. `scope:shared` is the
            // one way around that — request context such as auth — and the
            // second rule stops it being a way around the layering as well.
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:util', 'scope:shared'],
            },
            {
              sourceTag: 'type:data-access',
              notDependOnLibsWithTags: ['type:app', 'type:feature', 'type:ui'],
            },
            // Presentational only: a `ui` lib never knows where its data
            // comes from, so it cannot reach a store.
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util'],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util'],
            },
            // ADR-0005 Decision 12. Route extraction imports every route, so
            // one module-level `localStorage` read anywhere in a prerendered
            // app's graph fails the whole server build. `universal` means
            // safe to *import* on the server, not that it does anything there.
            // The rule covers direct imports only; it holds transitively
            // because every universal lib is held to it too.
            {
              sourceTag: 'platform:universal',
              onlyDependOnLibsWithTags: ['platform:universal'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      // `no-explicit-any` and `no-unused-vars` ship as warnings in the
      // typescript-eslint recommended set. Every lint target sets
      // `maxWarnings: 0`, so a warning already fails the build — these are
      // errors so the failure names the real problem rather than a count.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      // Debug logging has twice reached this repo carrying credentials
      // (a raw login form value and a persisted session). `warn`/`error` stay
      // allowed for genuine diagnostics such as the bootstrap failure handler
      // in `main.ts`.
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
];
