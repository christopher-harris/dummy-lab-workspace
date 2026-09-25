import {
  RuntimeConfigLoadError,
  RuntimeConfigLoader,
  parseRuntimeConfig,
} from './runtime-config';

describe('parseRuntimeConfig', () => {
  it('accepts and normalizes a public runtime configuration', () => {
    const config = parseRuntimeConfig({
      environment: 'stage',
      apiBaseUrl: 'https://dummyjson.com/',
      features: { experimentalCatalog: true },
    });

    expect(config).toEqual({
      environment: 'stage',
      apiBaseUrl: 'https://dummyjson.com',
      features: { experimentalCatalog: true },
    });
    expect(Object.isFrozen(config)).toBe(true);
    expect(Object.isFrozen(config.features)).toBe(true);
  });

  it.each([
    undefined,
    {
      environment: 'preview',
      apiBaseUrl: 'https://dummyjson.com',
      features: { experimentalCatalog: true },
    },
    {
      environment: 'dev',
      apiBaseUrl: 'not-a-url',
      features: { experimentalCatalog: true },
    },
    {
      environment: 'prod',
      apiBaseUrl: 'https://dummyjson.com',
      features: { experimentalCatalog: 'true' },
    },
  ])('rejects an invalid configuration', (config) => {
    expect(() => parseRuntimeConfig(config)).toThrow(RuntimeConfigLoadError);
  });
});

describe('RuntimeConfigLoader', () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchSpy);
    fetchSpy.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves the config relative to document.baseURI and disables fetch caching', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          environment: 'local',
          apiBaseUrl: 'https://dummyjson.com',
          features: { experimentalCatalog: true },
        }),
      ),
    );

    const loader = new RuntimeConfigLoader();
    await expect(loader.load()).resolves.toMatchObject({
      environment: 'local',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      new URL('runtime-config.json', document.baseURI),
      { cache: 'no-store' },
    );
    expect(loader.config.apiBaseUrl).toBe('https://dummyjson.com');
  });

  it('rejects a non-success response without providing a fallback', async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(new RuntimeConfigLoader().load()).rejects.toThrow(
      RuntimeConfigLoadError,
    );
  });
});
