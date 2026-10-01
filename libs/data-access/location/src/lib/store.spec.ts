import { TestBed } from '@angular/core/testing';
import { Events, injectDispatch } from '@ngrx/signals/events';
import type { Observable } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { locationEvents } from './actions';
import { DEFAULT_POSITION_OPTIONS, POSITION_ERROR } from './config';
import { GEOLOCATION, PERMISSIONS } from './platform';
import { LocationStore } from './store';

/**
 * A `Geolocation` that records what it was asked for instead of answering,
 * so a spec can resolve or reject each call by hand.
 */
const recordingGeolocation = () => {
  const calls: {
    success: PositionCallback;
    error: PositionErrorCallback | null | undefined;
    options: PositionOptions | undefined;
  }[] = [];

  const geolocation = {
    getCurrentPosition: (success, error, options) => {
      calls.push({ success, error, options });
    },
    watchPosition: () => 0,
    clearWatch: () => undefined,
  } satisfies Geolocation;

  return { geolocation, calls };
};

/**
 * A mutable stand-in for `PermissionStatus`, so a spec can change `state` and
 * fire `onchange` the way the browser would.
 */
const fakePermissionStatus = (state: PermissionState) => ({
  state,
  onchange: null as (() => void) | null,
});

type FakePermissionStatus = ReturnType<typeof fakePermissionStatus>;

const permissionsResolving = (status: FakePermissionStatus) =>
  ({
    query: () => Promise.resolve(status as unknown as PermissionStatus),
  }) as Permissions;

const permissionsRejecting = () =>
  ({
    // What Safari has historically done for the `geolocation` name.
    query: () => Promise.reject(new TypeError('not supported')),
  }) as Permissions;

const positionAt = (accuracy: number) =>
  ({
    coords: { latitude: 51.5074, longitude: -0.1278, accuracy },
    timestamp: 1_700_000_000_000,
  }) as unknown as GeolocationPosition;

const errorWithCode = (code: number) =>
  ({ code, message: 'nope' }) as GeolocationPositionError;

const setup = ({
  geolocation = recordingGeolocation().geolocation,
  permissions = null as Permissions | null,
}: {
  geolocation?: Geolocation | null;
  permissions?: Permissions | null;
} = {}) => {
  TestBed.configureTestingModule({
    providers: [
      { provide: GEOLOCATION, useValue: geolocation },
      { provide: PERMISSIONS, useValue: permissions },
    ],
  });
  return TestBed.inject(LocationStore);
};

describe('LocationStore', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  describe('support detection', () => {
    it('is supported when the browser exposes a Geolocation API', () => {
      expect(setup().supported()).toBe(true);
    });

    it('is unsupported when there is no Geolocation API', () => {
      expect(setup({ geolocation: null }).supported()).toBe(false);
    });

    it('starts idle with nothing held, either way', () => {
      const store = setup({ geolocation: null });

      expect(store.status()).toBe('idle');
      expect(store.position()).toBeNull();
      expect(store.failure()).toBeNull();
    });
  });

  describe('permission probe', () => {
    it('starts unknown before the query resolves', () => {
      const store = setup({
        permissions: permissionsResolving(fakePermissionStatus('granted')),
      });

      expect(store.permission()).toBe('unknown');
    });

    it.each(['granted', 'denied', 'prompt'] as const)(
      'reflects a reported state of %s',
      async (state) => {
        const store = setup({
          permissions: permissionsResolving(fakePermissionStatus(state)),
        });

        await vi.waitFor(() => expect(store.permission()).toBe(state));
      },
    );

    it('stays unknown when the browser has no Permissions API', async () => {
      const store = setup({ permissions: null });

      await vi.waitFor(() => expect(store.permission()).toBe('unknown'));
    });

    it('stays unknown when the query rejects', async () => {
      const store = setup({ permissions: permissionsRejecting() });

      await vi.waitFor(() => expect(store.permission()).toBe('unknown'));
    });

    it('does not probe when geolocation is unsupported', async () => {
      const query = vi.fn();
      const store = setup({
        geolocation: null,
        permissions: { query } as unknown as Permissions,
      });

      await vi.waitFor(() => expect(store.permission()).toBe('unknown'));
      expect(query).not.toHaveBeenCalled();
    });

    it('follows the permission being changed after the initial probe', async () => {
      const status = fakePermissionStatus('prompt');
      const store = setup({ permissions: permissionsResolving(status) });

      await vi.waitFor(() => expect(store.permission()).toBe('prompt'));

      status.state = 'granted';
      status.onchange?.();

      expect(store.permission()).toBe('granted');
    });
  });

  describe('request', () => {
    it('is a no-op when there is no Geolocation API', async () => {
      const store = setup({ geolocation: null });

      await store.request();

      expect(store.status()).toBe('idle');
    });

    it('passes the default options through', () => {
      const { geolocation, calls } = recordingGeolocation();
      setup({ geolocation }).request();

      expect(calls[0].options).toBe(DEFAULT_POSITION_OPTIONS);
    });

    it('lets a caller override the options', () => {
      const { geolocation, calls } = recordingGeolocation();
      const options = { timeout: 1_000 };

      setup({ geolocation }).request(options);

      expect(calls[0].options).toBe(options);
    });

    it('reports prompting while permission is not yet held', () => {
      const store = setup();

      store.request();

      expect(store.status()).toBe('prompting');
    });

    it('reports locating when permission is already held', async () => {
      const store = setup({
        permissions: permissionsResolving(fakePermissionStatus('granted')),
      });
      await vi.waitFor(() => expect(store.permission()).toBe('granted'));

      store.request();

      expect(store.status()).toBe('locating');
    });

    it('ignores a second request while one is outstanding', () => {
      const { geolocation, calls } = recordingGeolocation();
      const store = setup({ geolocation });

      store.request();
      store.request();

      expect(calls).toHaveLength(1);
    });

    it('flattens a successful fix', async () => {
      const { geolocation, calls } = recordingGeolocation();
      const store = setup({ geolocation });

      const pending = store.request();
      calls[0].success(positionAt(25));
      await pending;

      expect(store.status()).toBe('located');
      expect(store.failure()).toBeNull();
      expect(store.position()).toEqual({
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 25,
        timestamp: 1_700_000_000_000,
      });
    });

    it.each([
      [POSITION_ERROR.PERMISSION_DENIED, 'denied'],
      [POSITION_ERROR.POSITION_UNAVAILABLE, 'unavailable'],
      [POSITION_ERROR.TIMEOUT, 'timeout'],
      // Anything the platform invents later lands on the vague one.
      [99, 'unavailable'],
    ] as const)('maps error code %i to %s', async (code, failure) => {
      const { geolocation, calls } = recordingGeolocation();
      const store = setup({ geolocation });

      const pending = store.request();
      calls[0].error?.(errorWithCode(code));
      await pending;

      expect(store.status()).toBe('failed');
      expect(store.failure()).toBe(failure);
    });

    it('clears a stale failure but keeps the last known position', async () => {
      const { geolocation, calls } = recordingGeolocation();
      const store = setup({ geolocation });

      const located = store.request();
      calls[0].success(positionAt(25));
      await located;

      const failed = store.request();
      calls[1].error?.(errorWithCode(POSITION_ERROR.TIMEOUT));
      await failed;

      expect(store.failure()).toBe('timeout');
      expect(store.position()).not.toBeNull();

      // A new request drops the stale failure before it knows the outcome.
      store.request();

      expect(store.failure()).toBeNull();
      expect(store.position()).not.toBeNull();
    });
  });
});

/** Dispatch as a component would, from outside the store. */
const dispatcher = () =>
  TestBed.runInInjectionContext(() => injectDispatch(locationEvents));

/** Collect every payload an event emits from the moment of subscription. */
const payloadsOf = <T>(source: Observable<{ payload: T }>) => {
  const seen: T[] = [];
  source.subscribe(({ payload }) => seen.push(payload));
  return seen;
};

describe('LocationStore events', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('runs a request when locationRequested is dispatched', () => {
    const { geolocation, calls } = recordingGeolocation();
    setup({ geolocation });

    dispatcher().locationRequested();

    expect(calls).toHaveLength(1);
  });

  it('updates state from a dispatched request, with no store injected', () => {
    const { geolocation, calls } = recordingGeolocation();
    const store = setup({ geolocation });

    dispatcher().locationRequested();
    calls[0].success(positionAt(25));

    expect(store.status()).toBe('located');
  });

  it('announces a resolved fix', () => {
    const { geolocation, calls } = recordingGeolocation();
    setup({ geolocation });
    const resolved = payloadsOf(
      TestBed.inject(Events).on(locationEvents.locationResolved),
    );

    dispatcher().locationRequested();
    calls[0].success(positionAt(25));

    expect(resolved).toEqual([
      {
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 25,
        timestamp: 1_700_000_000_000,
      },
    ]);
  });

  it('announces a failure', () => {
    const { geolocation, calls } = recordingGeolocation();
    setup({ geolocation });
    const failed = payloadsOf(
      TestBed.inject(Events).on(locationEvents.locationFailed),
    );

    dispatcher().locationRequested();
    calls[0].error?.(errorWithCode(POSITION_ERROR.PERMISSION_DENIED));

    expect(failed).toEqual(['denied']);
  });

  it('announces the permission once the probe resolves', async () => {
    setup({
      permissions: permissionsResolving(fakePermissionStatus('prompt')),
    });
    const changes = payloadsOf(
      TestBed.inject(Events).on(locationEvents.permissionChanged),
    );

    await vi.waitFor(() => expect(changes).toEqual(['prompt']));
  });

  it('announces a later permission change', async () => {
    const status = fakePermissionStatus('prompt');
    setup({ permissions: permissionsResolving(status) });
    const changes = payloadsOf(
      TestBed.inject(Events).on(locationEvents.permissionChanged),
    );

    await vi.waitFor(() => expect(changes).toEqual(['prompt']));

    status.state = 'granted';
    status.onchange?.();

    expect(changes).toEqual(['prompt', 'granted']);
  });

  it('ignores a dispatch on a browser with no Geolocation API', () => {
    const store = setup({ geolocation: null });

    dispatcher().locationRequested();

    expect(store.status()).toBe('idle');
  });
});

describe('platform tokens', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  // jsdom implements neither API, so the default factories exercise their own
  // `?? null` fallbacks here. If jsdom ever ships them these should become
  // assertions that the tokens resolve to whatever `navigator` exposes.
  it('resolve to null where the platform has no such API', () => {
    expect(TestBed.inject(GEOLOCATION)).toBeNull();
    expect(TestBed.inject(PERMISSIONS)).toBeNull();
  });
});
