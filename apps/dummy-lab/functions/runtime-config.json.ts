interface Env {
  RUNTIME_CONFIG_JSON?: string;
}

type EnvironmentName = 'local' | 'dev' | 'stage' | 'prod';

interface RuntimeConfig {
  environment: EnvironmentName;
  apiBaseUrl: string;
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

function isRuntimeConfig(value: unknown): value is RuntimeConfig {
  if (!isRecord(value) || Object.keys(value).length !== 3) {
    return false;
  }

  const { apiBaseUrl, environment, features } = value;
  if (
    typeof environment !== 'string' ||
    !environmentNames.has(environment as EnvironmentName) ||
    typeof apiBaseUrl !== 'string' ||
    !isRecord(features) ||
    Object.keys(features).length !== 1 ||
    typeof features.experimentalCatalog !== 'boolean'
  ) {
    return false;
  }

  try {
    return new URL(apiBaseUrl).protocol === 'https:';
  } catch {
    return false;
  }
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
