import {
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
  inject,
} from '@angular/core';

const environments = ['local', 'dev', 'stage', 'prod'] as const;

export type RuntimeEnvironment = (typeof environments)[number];

/**
 * Public configuration supplied by the host at application start-up.
 *
 * Never add credentials, tokens, or other secrets: this document is delivered
 * to every browser that loads the application.
 */
export interface RuntimeConfig {
  readonly environment: RuntimeEnvironment;
  readonly apiBaseUrl: string;
  /** Origin of the headless CMS. Content only; never the same host as `apiBaseUrl`. */
  readonly cmsBaseUrl: string;
  readonly features: Readonly<{
    experimentalCatalog: boolean;
  }>;
}

export class RuntimeConfigLoadError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'RuntimeConfigLoadError';
  }
}

/**
 * Validates one absolute base URL and strips a trailing slash, so every caller
 * can build paths as `${base}/thing` without guessing whether to add one.
 */
function parseBaseUrl(value: unknown, label: string): string {
  if (typeof value !== 'string') {
    throw new RuntimeConfigLoadError(
      `Runtime configuration has an invalid ${label} base URL.`,
    );
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch (cause) {
    throw new RuntimeConfigLoadError(
      `Runtime configuration has an invalid ${label} base URL.`,
      cause,
    );
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new RuntimeConfigLoadError(
      `Runtime configuration ${label} base URL must use HTTP or HTTPS.`,
    );
  }

  return url.toString().replace(/\/$/, '');
}

/** Validates and freezes the public configuration returned by the host. */
export function parseRuntimeConfig(value: unknown): RuntimeConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RuntimeConfigLoadError(
      'Runtime configuration must be an object.',
    );
  }

  const candidate = value as Record<string, unknown>;
  const features = candidate['features'];

  if (!environments.includes(candidate['environment'] as RuntimeEnvironment)) {
    throw new RuntimeConfigLoadError(
      'Runtime configuration has an invalid environment.',
    );
  }

  if (!features || typeof features !== 'object' || Array.isArray(features)) {
    throw new RuntimeConfigLoadError(
      'Runtime configuration has invalid features.',
    );
  }

  if (
    typeof (features as Record<string, unknown>)['experimentalCatalog'] !==
    'boolean'
  ) {
    throw new RuntimeConfigLoadError(
      'Runtime configuration must define features.experimentalCatalog as a boolean.',
    );
  }

  return Object.freeze({
    environment: candidate['environment'] as RuntimeEnvironment,
    apiBaseUrl: parseBaseUrl(candidate['apiBaseUrl'], 'API'),
    cmsBaseUrl: parseBaseUrl(candidate['cmsBaseUrl'], 'CMS'),
    features: Object.freeze({
      experimentalCatalog: (features as Record<string, boolean>)[
        'experimentalCatalog'
      ],
    }),
  });
}

@Injectable()
export class RuntimeConfigLoader {
  private configValue: RuntimeConfig | undefined;
  private loadPromise: Promise<RuntimeConfig> | undefined;

  get config(): RuntimeConfig {
    if (!this.configValue) {
      throw new RuntimeConfigLoadError(
        'Runtime configuration was accessed before it loaded.',
      );
    }

    return this.configValue;
  }

  load(): Promise<RuntimeConfig> {
    this.loadPromise ??= this.fetchConfig();
    return this.loadPromise;
  }

  private async fetchConfig(): Promise<RuntimeConfig> {
    const configUrl = new URL('runtime-config.json', document.baseURI);
    let response: Response;

    try {
      response = await fetch(configUrl, { cache: 'no-store' });
    } catch (cause) {
      throw new RuntimeConfigLoadError(
        'Runtime configuration could not be requested.',
        cause,
      );
    }

    if (!response.ok) {
      throw new RuntimeConfigLoadError(
        `Runtime configuration request failed with status ${response.status}.`,
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (cause) {
      throw new RuntimeConfigLoadError(
        'Runtime configuration is not valid JSON.',
        cause,
      );
    }

    this.configValue = parseRuntimeConfig(payload);
    return this.configValue;
  }
}

/**
 * Makes public host configuration available after it has loaded before app
 * bootstrap. Consumers inject `RUNTIME_CONFIG`; they never know the host.
 */
export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>(
  'RUNTIME_CONFIG',
);

export function provideRuntimeConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    RuntimeConfigLoader,
    {
      provide: RUNTIME_CONFIG,
      useFactory: (loader: RuntimeConfigLoader) => loader.config,
      deps: [RuntimeConfigLoader],
    },
    provideAppInitializer(() => inject(RuntimeConfigLoader).load()),
  ]);
}
