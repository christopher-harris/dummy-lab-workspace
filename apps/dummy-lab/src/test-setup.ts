/**
 * Global setup for the dummy-lab unit tests.
 *
 * Wired in via the `setupFiles` option on the `test` target in project.json.
 * The `@angular/build:unit-test` builder bootstraps the TestBed itself, so this
 * file only has to patch the gaps between jsdom and a real browser.
 */

import { TestBed } from '@angular/core/testing';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import { beforeEach } from 'vitest';

const testRuntimeConfig = {
  environment: 'local' as const,
  apiBaseUrl: 'https://dummyjson.com',
  features: { experimentalCatalog: true },
};

// Data-access stores read this token during construction. Supplying it here
// keeps isolated component specs aligned with the app bootstrap contract.
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [{ provide: RUNTIME_CONFIG, useValue: testRuntimeConfig }],
  });
});

// jsdom ships no `matchMedia`. PrimeNG's Menubar (and several other components)
// call it during ngOnInit, which takes down any spec that renders them.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined, // deprecated, still called by some libs
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// jsdom has no layout engine, so these are missing or always zero. PrimeNG's
// overlay positioning reads them.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {
      /* no-op */
    }
    unobserve() {
      /* no-op */
    }
    disconnect() {
      /* no-op */
    }
  };
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined;
}

// Fail loudly on unmocked network calls. Several signal stores kick off
// `resource()` loaders that use raw `fetch` on construction; without this a
// spec silently hits dummyjson.com, which is slow, flaky, and can hang
// `fixture.whenStable()` until the hook times out.
//
// Specs that genuinely need a response should stub it themselves, e.g.
//   vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ products: [] }));
globalThis.fetch = (input: RequestInfo | URL) => {
  const url = typeof input === 'string' ? input : input.toString();
  return Promise.reject(
    new Error(
      `Unmocked network request to "${url}". Stub globalThis.fetch in this spec, ` +
        `or use provideHttpClientTesting() for HttpClient-based calls.`,
    ),
  );
};
