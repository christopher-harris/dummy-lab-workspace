interface Env {
  RUNTIME_CONFIG_JSON?: string;
}

type EnvironmentName = 'local' | 'dev' | 'stage' | 'prod';

interface RuntimeConfig {
  environment: EnvironmentName;
  apiBaseUrl: string;
  cmsBaseUrl: string;
  features: {
    experimentalCatalog: boolean;
  };
}

const environmentNames = new Set<EnvironmentName>([
  'local',
  'dev',
  'stage',
  'prod',
]);

const responseHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Deployed configuration is served over the public internet, so both origins
 * must be HTTPS here. The in-browser parser accepts HTTP as well, which is what
 * lets `public/runtime-config.json` point at a local Strapi on port 1337; this
 * adapter never serves that file.
 */
function isHttpsUrl(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function isRuntimeConfig(value: unknown): value is RuntimeConfig {
  if (!isRecord(value) || Object.keys(value).length !== 4) {
    return false;
  }

  const { apiBaseUrl, cmsBaseUrl, environment, features } = value;
  if (
    typeof environment !== 'string' ||
    !environmentNames.has(environment as EnvironmentName) ||
    !isRecord(features) ||
    Object.keys(features).length !== 1 ||
    typeof features.experimentalCatalog !== 'boolean'
  ) {
    return false;
  }

  return isHttpsUrl(apiBaseUrl) && isHttpsUrl(cmsBaseUrl);
}

function parseRuntimeConfig(value: string | undefined): RuntimeConfig | null {
  if (!value) {
    return null;
  }

  try {
    const config: unknown = JSON.parse(value);
    return isRuntimeConfig(config) ? config : null;
  } catch {
    return null;
  }
}

export const onRequestGet: PagesFunction<Env> = ({ env }) => {
  const config = parseRuntimeConfig(env.RUNTIME_CONFIG_JSON);

  if (!config) {
    return Response.json(
      { error: 'Runtime configuration unavailable.' },
      {
        status: 500,
        headers: responseHeaders,
      },
    );
  }

  return Response.json(config, { headers: responseHeaders });
};
