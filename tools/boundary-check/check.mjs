// Proves the module-boundary rules reject what ADR-0001 and ADR-0005 forbid.
//
// `nx lint` passing only shows no violation exists today; a rule loosened to
// `['*']` passes it too. This lints synthetic imports — never written to
// disk — from inside real projects, through each project's own ESLint config,
// and fails if a forbidden edge is accepted or an allowed edge is rejected.
// It also fails on a missing or unknown `type:*`/`scope:*`/`platform:*` tag.
//
// Run directly rather than as a cached Nx target: its inputs are every
// project.json, tsconfig.base.json and eslint.config.mjs, and a stale cache
// hit is precisely the false green this exists to catch.
//
//   node tools/boundary-check/check.mjs
import { join } from 'node:path';
import devkit from '@nx/devkit';
import { ESLint } from 'eslint';

const { createProjectGraphAsync, workspaceRoot } = devkit;

const RULE = '@nx/enforce-module-boundaries';
const TYPES = [
  'type:app',
  'type:feature',
  'type:data-access',
  'type:ui',
  'type:util',
];
const PLATFORMS = ['platform:universal', 'platform:browser-only'];

// The edge table in docs/ADR/ADR-0001 ("Allowed dependency edges"), plus
// ADR-0005 Decision 12. `rejectedBy` is the source tag the error must cite,
// so a case cannot pass because some other constraint happened to fire.
const CASES = [
  // Allowed
  { from: 'dummy-lab', to: '@dummy-lab/feature-content-blocks' },
  { from: 'feature-content-blocks', to: '@dummy-lab/data-access-pages' },
  { from: 'feature-content-blocks', to: '@dummy-lab/ui-content-blocks' },
  // A facade composing two domains lives in a feature lib (ADR-0001 §6).
  { from: 'feature-session-cart', to: '@dummy-lab/data-access-products' },
  { from: 'carts', to: '@dummy-lab/shared-utils' },
  { from: 'carts', to: '@dummy-lab/data-access-auth' },
  { from: 'content-blocks', to: '@dummy-lab/shared-utils' },
  { from: 'utils', to: '@dummy-lab/shared-models' },

  // Forbidden. The first is ROADMAP Phase D's exit gate.
  {
    from: 'content-blocks',
    to: '@dummy-lab/data-access-pages',
    rejectedBy: 'type:ui',
  },
  {
    from: 'content-blocks',
    to: '@dummy-lab/feature-session-cart',
    rejectedBy: 'type:ui',
  },
  {
    from: 'feature-content-blocks',
    to: '@dummy-lab/feature-session-cart',
    rejectedBy: 'type:feature',
  },
  {
    from: 'carts',
    to: '@dummy-lab/data-access-products',
    rejectedBy: 'type:data-access',
  },
  {
    from: 'auth',
    to: '@dummy-lab/data-access-carts',
    rejectedBy: 'type:data-access',
  },
  {
    from: 'pages',
    to: '@dummy-lab/feature-content-blocks',
    rejectedBy: 'type:data-access',
  },
  {
    from: 'pages',
    to: '@dummy-lab/ui-content-blocks',
    rejectedBy: 'type:data-access',
  },
  { from: 'utils', to: '@dummy-lab/data-access-auth', rejectedBy: 'type:util' },
  {
    from: 'utils',
    to: '@dummy-lab/ui-content-blocks',
    rejectedBy: 'type:util',
  },
  {
    from: 'utils',
    to: '@dummy-lab/fixture-browser-only',
    rejectedBy: 'platform:universal',
  },
  {
    from: 'dummy-lab',
    to: '@dummy-lab/fixture-browser-only',
    rejectedBy: 'platform:universal',
  },
];

const graph = await createProjectGraphAsync({ exitOnError: true });
const projects = Object.values(graph.nodes);
const failures = [];

for (const { name, data } of projects) {
  const tags = data.tags ?? [];
  const on = (axis) => tags.filter((t) => t.startsWith(`${axis}:`));
  const [types, scopes, platforms] = [on('type'), on('scope'), on('platform')];

  if (types.length !== 1 || !TYPES.includes(types[0])) {
    failures.push(
      `${name}: needs exactly one of ${TYPES.join(', ')} — has [${types}]`,
    );
  }
  if (scopes.length !== 1) {
    failures.push(`${name}: needs exactly one scope:* tag — has [${scopes}]`);
  }
  // The boundary rule only runs where lint runs, so that is where the axis is
  // required. `cms` is Strapi and has no lint target.
  const linted = Boolean(data.targets?.lint);
  if (
    (linted || platforms.length) &&
    (platforms.length !== 1 || !PLATFORMS.includes(platforms[0]))
  ) {
    failures.push(
      `${name}: needs exactly one of ${PLATFORMS.join(', ')} — has [${platforms}]`,
    );
  }
}

const linters = new Map();
const linterFor = (root) => {
  // ESLint searches up from `cwd`, so this resolves the config the project's
  // lint target would — its own if it has one — and a project that disables
  // the rule is caught.
  const cwd = join(workspaceRoot, root);
  if (!linters.has(cwd)) linters.set(cwd, new ESLint({ cwd }));
  return linters.get(cwd);
};

for (const { from, to, rejectedBy } of CASES) {
  const label = `${from} → ${to}`;
  const source = graph.nodes[from];
  if (!source) {
    failures.push(`${label}: no project named "${from}" — update CASES`);
    continue;
  }
  const filePath = join(
    workspaceRoot,
    source.data.sourceRoot ?? source.data.root,
    '__boundary_check__.ts',
  );
  const [result] = await linterFor(source.data.root).lintText(
    `import '${to}';\n`,
    {
      filePath,
      warnIgnored: true,
    },
  );
  const fatal = result.messages.find((m) => m.fatal);
  if (fatal) {
    failures.push(`${label}: lint could not run — ${fatal.message}`);
    continue;
  }
  const errors = result.messages
    .filter((m) => m.ruleId === RULE)
    .map((m) => m.message);

  if (!rejectedBy && errors.length) {
    failures.push(
      `${label}: allowed by ADR-0001 but rejected — ${errors.join('; ')}`,
    );
  } else if (rejectedBy && !errors.some((e) => e.includes(`"${rejectedBy}"`))) {
    failures.push(
      `${label}: forbidden for ${rejectedBy} but ` +
        (errors.length
          ? `rejected for another reason — ${errors.join('; ')}`
          : 'accepted'),
    );
  }
}

if (failures.length) {
  console.error(`Module boundary check failed (${failures.length}):\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
const rejected = CASES.filter((c) => c.rejectedBy).length;
console.log(
  `Module boundaries hold: ${projects.length} projects tagged, ` +
    `${CASES.length - rejected} allowed edges accepted, ${rejected} forbidden edges rejected.`,
);
