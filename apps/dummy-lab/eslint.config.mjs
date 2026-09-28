import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'dl',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'dl',
          style: 'kebab-case',
        },
      ],
      // Angular v22 makes OnPush the default: a component with no `changeDetection`
      // is checked using OnPush. The v22 migration (`chore: [nx migration]
      // change-detection-eager`) added an explicit `ChangeDetectionStrategy.Eager`
      // to all 21 components to preserve the old implicit `Default`; those were
      // reviewed and removed, so every component now inherits the OnPush default.
      //
      // `allowExplicitOnPush: false` keeps one way to express it — omission. A
      // component that genuinely needs eager checking sets `Eager` with an
      // `eslint-disable-next-line` and a written reason, so the exception is
      // reviewable instead of invisible.
      '@angular-eslint/prefer-on-push-component-change-detection': [
        'error',
        { allowExplicitOnPush: false },
      ],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];
