# 🤖 Runtime configuration across static hosts with Nx

This guide defines a hosting-neutral runtime-configuration pattern, then uses
Cloudflare Pages Functions as the sandbox adapter. Angular knows only how to
fetch a same-origin JSON document; it does not consume Cloudflare APIs, Worker
bindings, metadata, or deployment-specific URLs.

The goal is one compiled Angular application artifact promoted through `dev`,
`stage`, and `prod` without Angular file replacements. Public runtime
configuration is deliberately a separate, environment-owned deployment input.

## Platform-neutral architecture and guardrails

```text
Angular application
  | GET /runtime-config.json before bootstrap
  v
validated RuntimeConfig through Angular DI
  |
  +-- data-access API base URL
  +-- public environment label
  +-- harmless feature switch

Hosting adapter
  | serves environment-owned public JSON
  v
/runtime-config.json
```

The JavaScript, CSS, and other compiled Angular assets are identical in every
hosted environment. Only the `/runtime-config.json` response varies. That
response is public configuration, not a secret store or a server-side feature
flag service.

Choose the simplest adapter that can serve the contract without changing
Angular:

| Platform                        | Adapter                                                                                                                                                 | When to use it                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **AWS S3 + CloudFront**         | **Recommended baseline:** publish the same compiled assets, then publish an environment-specific `runtime-config.json` object at the distribution root. | Standard static hosting; no request-time computation is needed.                                        |
| Cloudflare Pages                | Pages Function returns the JSON from a Pages variable.                                                                                                  | This sandbox's first adapter; see [Cloudflare sandbox adapter](#2-add-the-cloudflare-sandbox-adapter). |
| CloudFront + Lambda/API Gateway | Route `/runtime-config.json` to a function returning the same JSON.                                                                                     | Only when config must be calculated or authorized at request time.                                     |
| Kubernetes, ECS, nginx          | Serve the JSON from a mounted config file or small endpoint.                                                                                            | Container-hosted static applications.                                                                  |

Prefer the static JSON object on AWS (or any ordinary static host). Adding a
function just to emit fixed JSON increases cost, failure modes, deployment
surface, and migration work without adding value. A function is justified only
when the response must be computed at request time; the JSON contract and
Angular code remain the same either way.

Never put credentials, tokens, or other secrets in runtime config. Anything
delivered to the browser is public.

## Public configuration contract

Start with this small, public contract:

```ts
export interface RuntimeConfig {
  environment: 'local' | 'dev' | 'stage' | 'prod';
  apiBaseUrl: string;
  features: {
    experimentalCatalog: boolean;
  };
}
```

`apiBaseUrl` replaces the hardcoded DummyJSON constant. `environment` produces
a visible non-production-style badge. `experimentalCatalog` gates one harmless
catalog card or route, proving that runtime config changes application behavior
without pretending this is a production feature-flag system.

All hosted environments use `https://dummyjson.com` for now, consistent with
the workspace rule that DummyJSON is the only external API.

### Promotion and caching rules

Treat the app assets and runtime configuration as separate deployment inputs:

- Build the Angular application once through Nx and retain an asset manifest.
  Promote those compiled assets unchanged to every environment.
- Give each environment ownership of its own validated public config response.
  A config-only change must not require rebuilding Angular.
- Serve `/runtime-config.json` with `Cache-Control: no-store` for this proof.
  The application should pick up a valid config change on reload. If a future
  short-TTL policy is needed, define explicit cache invalidation and rollback
  behavior first.
- On AWS S3 + CloudFront, upload the common app assets first and then the
  environment's `runtime-config.json` object. Apply the no-store header to that
  object; do not invalidate the whole distribution merely to update config.

## 1. Create Nx-owned runtime-config infrastructure

Create a non-buildable internal library. Do not hand-create a `project.json` or
TypeScript path mapping.

First inspect the generator output:

```bash
npm exec nx -- g @nx/angular:library \
  --directory=libs/shared/runtime-config \
  --name=runtime-config \
  --importPath=@dummy-lab/shared-runtime-config \
  --tags=type:util,scope:shared \
  --unitTestRunner=vitest-analog \
  --standalone=false \
  --skipModule \
  --dry-run \
  --no-interactive
```

The dry-run should create `libs/shared/runtime-config` and update
`tsconfig.base.json` plus ESLint wiring. The workspace may also print its known
deprecated explicit ESLint-executor warning; that is unrelated to this work.

After review, rerun the command without `--dry-run`.

In `@dummy-lab/shared-runtime-config`, add and export:

- The `RuntimeConfig` interface and a narrow runtime validator.
- A read-only `RUNTIME_CONFIG` `InjectionToken<RuntimeConfig>`.
- `provideRuntimeConfig()`, using `provideAppInitializer()` to fetch
  `/runtime-config.json` before Angular bootstraps.
- A typed `RuntimeConfigLoadError` for failed fetches, non-OK responses,
  invalid JSON, invalid URLs, or invalid schema.

There must be no fallback to production values. If config is malformed or
unavailable, reject initialization and prevent bootstrap. An Angular component
cannot render after bootstrap has failed, so `main.ts` must catch the rejected
`bootstrapApplication()` promise and replace the pre-existing `dl-root`
placeholder with a small static startup-error view. Silent fallback is how
lower-environment traffic eventually reaches production.

Fetch config with this platform-neutral boundary:

```ts
fetch(new URL('runtime-config.json', document.baseURI), { cache: 'no-store' });
```

Resolving from `document.baseURI` preserves the existing GitHub Pages project
subpath as well as working at the Cloudflare site root.

### Local Nx serving

Add the local, non-secret fallback at
`apps/dummy-lab/public/runtime-config.json`:

```json
{
  "environment": "local",
  "apiBaseUrl": "https://dummyjson.com",
  "features": { "experimentalCatalog": true }
}
```

The existing Nx workflow continues to serve this file:

```bash
npm exec nx serve dummy-lab
```

### Consume configuration through DI

Register `provideRuntimeConfig()` in
`apps/dummy-lab/src/app/app.config.ts` before application consumers. Replace
all `DUMMY_JSON_BASE_URL` uses in data-access stores, API helpers, and the auth
interceptor with `inject(RUNTIME_CONFIG).apiBaseUrl`.

Do not read config at module top level; it has not loaded during module
evaluation. Services, stores, and interceptors must read the token inside an
Angular injection context.

Remove the hardcoded URL export only after every consumer has migrated. Add the
environment badge and feature-gated catalog surface at the same time.

## 2. Add the Cloudflare sandbox adapter

Install Wrangler as a workspace dev dependency:

```bash
npm install -D wrangler@latest
npm exec wrangler -- --version
```

### Establish the Pages project root

For this adapter, `apps/dummy-lab` is the **Pages project root**. Put the
Function at `apps/dummy-lab/functions/runtime-config.json.ts`; do not put it in
`dist`, `public`, or the Angular source tree. Pages' file-based routing maps
that file to `/runtime-config.json`.

This is a Direct Upload project, so there is no dashboard "root directory"
setting to configure. The Nx deploy target must run Wrangler with
`apps/dummy-lab` as its working directory so it discovers that `functions/`
folder while it uploads `../../dist/apps/dummy-lab/browser`.

Do **not** add `RUNTIME_CONFIG_JSON` to a committed `wrangler.jsonc`. A Pages
Wrangler configuration that includes `pages_build_output_dir` becomes the
source of truth for its configured project and can overwrite matching dashboard
settings on deploy. This sandbox deliberately keeps the public runtime value in
each Pages project's dashboard configuration. If a future need requires a
committed Wrangler file, put it at `apps/dummy-lab/wrangler.jsonc`, set
`pages_build_output_dir` relative to that directory, and first generate it with
`npm exec wrangler -- pages download config <project-name>`; do not create a
root-level local-only configuration.

### Implement the endpoint

Create `apps/dummy-lab/functions/runtime-config.json.ts`. This is a Cloudflare
adapter only; it does not leak into Angular code. Keep the runtime check here
narrow and in sync with the platform-neutral contract:

```ts
interface Env {
  RUNTIME_CONFIG_JSON?: string;
}

type RuntimeConfig = {
  environment: 'local' | 'dev' | 'stage' | 'prod';
  apiBaseUrl: string;
  features: { experimentalCatalog: boolean };
};

const responseHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

function parseRuntimeConfig(value: string | undefined): RuntimeConfig | null {
  if (!value) return null;

  try {
    const config: unknown = JSON.parse(value);
    if (!config || typeof config !== 'object') return null;
    const candidate = config as Record<string, unknown>;
    const features = candidate['features'] as
      | Record<string, unknown>
      | undefined;
    const environment = candidate['environment'];
    const apiBaseUrl = candidate['apiBaseUrl'];

    if (
      !['local', 'dev', 'stage', 'prod'].includes(environment as string) ||
      typeof apiBaseUrl !== 'string' ||
      typeof features?.['experimentalCatalog'] !== 'boolean'
    )
      return null;

    const url = new URL(apiBaseUrl);
    if (url.protocol !== 'https:') return null;
    return config as RuntimeConfig;
  } catch {
    return null;
  }
}

export const onRequestGet = ({ env }: { env: Env }): Response => {
  const config = parseRuntimeConfig(env.RUNTIME_CONFIG_JSON);
  if (!config)
    return new Response('Runtime configuration unavailable.', { status: 500 });

  return new Response(JSON.stringify(config), { headers: responseHeaders });
};
```

The endpoint reads one public plain-text `RUNTIME_CONFIG_JSON` variable from
`context.env`, validates it, and returns a generic `500` on invalid/missing
configuration without logging its content. It takes precedence over the
deployed static local fallback at the same URL.

The `Env` interface is deliberately declared beside the adapter. Dashboard
variables do not generate TypeScript types; do not claim that `wrangler types`
can infer a value created only in the Pages dashboard.

### Limit Functions to the config route

Pages Functions otherwise run before static assets by default. Add this file to
`apps/dummy-lab/public/_routes.json` so Angular copies it into the deployed
browser directory:

```json
{
  "version": 1,
  "include": ["/runtime-config.json"],
  "exclude": []
}
```

Verify it exists at `dist/apps/dummy-lab/browser/_routes.json` after the Nx
build. This keeps static assets on the static path and invokes the Function only
for runtime configuration.

Add these `nx:run-commands` targets to `apps/dummy-lab/project.json`:

| Target                       | Responsibility                                                                                                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `serve-cloudflare`           | Build with `dummy-lab:build:development`, then from `apps/dummy-lab` run `wrangler pages dev ../../dist/apps/dummy-lab/browser` with the local binding.                                 |
| `deploy-cloudflare`          | From `apps/dummy-lab`, upload the already-built `../../dist/apps/dummy-lab/browser` using `wrangler pages deploy`; pass the Pages project as `--projectName=<name>`. It must not build. |
| `check-cloudflare-functions` | Compile `functions` using `wrangler pages functions build` to catch Function syntax/type errors.                                                                                        |

Nx owns building. Do not add a separate `ng build` or `npm run build` route for
Cloudflare.

For local Pages Function testing, use ignored `apps/dummy-lab/.dev.vars`:

```text
RUNTIME_CONFIG_JSON={"environment":"local","apiBaseUrl":"https://dummyjson.com","features":{"experimentalCatalog":true}}
```

Run the Nx Cloudflare serve target, then verify its reported port:

```bash
curl -i http://localhost:8788/runtime-config.json
```

The app and endpoint share an origin, so no CORS configuration is needed.

## 3. Create Cloudflare environments

Create three **Direct Upload** Pages projects:

- `dummy-lab-dev`
- `dummy-lab-stage`
- `dummy-lab-prod`

Direct Upload is intentional: Cloudflare Git integration builds each Pages
project independently. This proof requires GitHub Actions to build once and
upload that exact output to every environment.

### Cloudflare dashboard checklist

1. In **Workers & Pages**, create a Pages project with **Direct Upload** for
   each name above. Do not connect the GitHub repository. A Direct Upload
   project cannot later be changed to Git integration, which is fine here:
   GitHub Actions is deliberately the build authority.
2. Open each project, choose **Settings → Variables and Secrets → Add**, select
   a plain-text variable (not Encrypt), and add `RUNTIME_CONFIG_JSON` to its
   **Production** environment. Do not add a preview value; the three Pages
   projects are the stable environments in this proof.
3. Paste exactly one minified JSON document as the value. These are public by
   design; browser-visible configuration is never a secret.
4. Deploy after saving the variable. A Pages Function receives the value in its
   deployment environment, so changing it requires a new Pages deployment but
   never an Angular rebuild.

Use these values (each must be entered as one line in the Cloudflare form):

`dummy-lab-dev`

```json
{
  "environment": "dev",
  "apiBaseUrl": "https://dummyjson.com",
  "features": { "experimentalCatalog": true }
}
```

`dummy-lab-stage`

```json
{
  "environment": "stage",
  "apiBaseUrl": "https://dummyjson.com",
  "features": { "experimentalCatalog": true }
}
```

`dummy-lab-prod`

```json
{
  "environment": "prod",
  "apiBaseUrl": "https://dummyjson.com",
  "features": { "experimentalCatalog": false }
}
```

If an adapter ever needs a credential to obtain the public document, store that
credential as an encrypted Cloudflare secret and return only approved public
JSON. The JSON above itself must remain a regular variable, not a secret.

### Create and test the deployment credential

1. In Cloudflare, open **Manage Account → API Tokens → Create Token → Custom
   Token**. Create a token named `github-actions-dummy-lab-pages`.
2. Give it **Account → Cloudflare Pages → Edit** permission and restrict its
   account resources to the account hosting these Pages projects. Do not grant
   zone, DNS, Workers, or account-administration permissions.
3. Copy the token immediately; Cloudflare shows it only once. Find the same
   account's ID in the dashboard's API section.
4. For a local smoke deploy only, authenticate with `wrangler login` (do not
   paste the CI token into a shell history), build once with Nx, and deploy from
   the Pages project root:

```bash
npm exec wrangler -- login
npm exec nx -- build dummy-lab --configuration=production
npm exec nx -- run dummy-lab:deploy-cloudflare --projectName=dummy-lab-dev
```

The Nx target runs Wrangler from `apps/dummy-lab`; that is how it includes the
Function under `apps/dummy-lab/functions`. Do not use dashboard drag-and-drop:
it does not compile a `functions/` directory.

After deploy, use the deployment URL printed by Wrangler and verify:

```bash
curl --include --fail --silent --show-error "$DEPLOYMENT_URL/runtime-config.json"
```

It must return the expected JSON, with `cache-control: no-store`. Reload the
app and confirm that its visible environment label and experimental catalog
match that environment.

## 4. Promote one artifact with GitHub Actions

Create GitHub Environments: `dev`, `stage`, and `prod`.

- `dev` may deploy automatically.
- Add approval gates to `stage` and `prod` when collaborators warrant them.
- In every GitHub Environment, store `CLOUDFLARE_API_TOKEN` as a GitHub secret
  and `CLOUDFLARE_ACCOUNT_ID` as a GitHub variable. The token needs only
  Account → Cloudflare Pages → Edit on the selected Cloudflare account.

Add a manual `deploy-cloudflare.yml` workflow that takes a commit/ref and runs:

1. **build**: checkout the ref, run `npm ci`, then
   `npm exec nx -- build dummy-lab --configuration=production`. Generate a
   SHA-256 manifest for `dist/apps/dummy-lab/browser` and upload that directory,
   `apps/dummy-lab/functions`, and the manifest as one Actions artifact. Restore
   both paths in every deploy job so Wrangler runs from the Pages project root
   and finds the Function.
2. **deploy-dev**: download the artifact unchanged; deploy it to
   `dummy-lab-dev` with Wrangler from the artifact's Pages-project root, then
   smoke-test the config endpoint.
3. **deploy-stage**: depend on dev, use the `stage` Environment, deploy the
   same downloaded artifact to `dummy-lab-stage`, and smoke-test it.
4. **deploy-prod**: depend on stage, use the `prod` Environment, deploy the
   same downloaded artifact to `dummy-lab-prod`, and smoke-test it.

Every deployment job must compare its downloaded manifest with the build-job
manifest before upload. It must never check out and rebuild the app.

Keep the existing GitHub Pages workflow unchanged initially. Its project-site
base href needs a separate build and is not part of this promotion proof.

## 5. Validate the proof

Run focused Nx checks after implementation:

```bash
npm exec nx test runtime-config
npm exec nx test dummy-lab
npm exec nx lint runtime-config
npm exec nx lint dummy-lab
npm exec nx -- build dummy-lab --configuration=production
npm exec nx run dummy-lab:check-cloudflare-functions
```

Add tests for:

- Valid config loading and delayed bootstrap.
- Missing endpoint, non-OK response, invalid JSON, invalid URL, and invalid
  schema all producing the startup failure state.
- A data-access store/helper and the auth interceptor using injected
  `apiBaseUrl`.
- The environment badge and experimental-catalog gate.
- Pages Function response schema/headers and generic error behavior.
- `_routes.json` being emitted into the browser output and limiting Function
  invocation to `/runtime-config.json`.

The proof is complete only when:

- Dev, stage, and prod received the identical static artifact manifest.
- Each host's `/runtime-config.json` reports its own expected environment.
- Dev/stage enable the experimental capability and prod does not.
- A public config change takes effect on reload without rebuilding Angular.
- No Cloudflare type, URL, or metadata appears in Angular application code.

## Operating notes

- Add `schemaVersion` before making a breaking config-contract change, then
  reject unsupported versions at startup.
- `no-store` is appropriate for this small document. A later short-TTL policy
  needs explicit reload and rollback rules.
- Changing a Pages Function binding can require a redeploy. Treat config
  changes as reviewable operational changes, not real-time feature management.
- The portability check is deliberately simple: replace the Pages Function with
  any server returning the same JSON at the same path. Angular must not change.
