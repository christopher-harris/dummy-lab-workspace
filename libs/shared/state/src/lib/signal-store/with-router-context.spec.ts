import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { signalStore } from '@ngrx/signals';
import { beforeEach, describe, expect, it } from 'vitest';

import { withRouterContext } from './with-router-context';

@Component({ template: '' })
class BlankComponent {}

const RouterContextStore = signalStore(
  { providedIn: 'root' },
  withRouterContext(),
);

describe('withRouterContext', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: BlankComponent },
          { path: 'products/:productId', component: BlankComponent },
          {
            path: 'products/:productId/reviews/:reviewId',
            component: BlankComponent,
          },
        ]),
      ],
    });
  });

  it('seeds route and query params from the current URL', async () => {
    await RouterTestingHarness.create('/products/7?page=2');

    const store = TestBed.inject(RouterContextStore);

    expect(store.routeParams()).toEqual({ productId: '7' });
    expect(store.routeQueryParams()).toEqual({ page: '2' });
  });

  it('merges params from every primary-outlet segment', async () => {
    await RouterTestingHarness.create('/products/7/reviews/3');

    const store = TestBed.inject(RouterContextStore);

    expect(store.routeParams()).toEqual({ productId: '7', reviewId: '3' });
  });

  it('refreshes after each navigation', async () => {
    const harness = await RouterTestingHarness.create('/products/7?page=2');
    const store = TestBed.inject(RouterContextStore);

    await harness.navigateByUrl('/products/9?page=5');

    expect(store.routeParams()).toEqual({ productId: '9' });
    expect(store.routeQueryParams()).toEqual({ page: '5' });
  });

  it('clears params when navigating to a route without them', async () => {
    const harness = await RouterTestingHarness.create('/products/7?page=2');
    const store = TestBed.inject(RouterContextStore);

    await harness.navigateByUrl('/');

    expect(store.routeParams()).toEqual({});
    expect(store.routeQueryParams()).toEqual({});
  });

  it('exposes ParamMap views and single-param readers', async () => {
    await RouterTestingHarness.create('/products/7?page=2');

    const store = TestBed.inject(RouterContextStore);

    expect(store.routeParamMap().get('productId')).toBe('7');
    expect(store.routeQueryParamMap().get('page')).toBe('2');
    expect(store.routeParam('productId')).toBe('7');
    expect(store.routeQueryParam('page')).toBe('2');
  });

  it('returns null for params that are not present', async () => {
    await RouterTestingHarness.create('/products/7');

    const store = TestBed.inject(RouterContextStore);

    expect(store.routeParam('missing')).toBeNull();
    expect(store.routeQueryParam('page')).toBeNull();
  });
});
