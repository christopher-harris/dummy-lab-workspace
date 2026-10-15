import type { UrlSegment } from '@angular/router';

import { normalizePagePath, pagePathFromSegments } from './route-path';

/**
 * `UrlSegment` carries `parameters` and `parameterMap` too, and neither is
 * read, so the cast keeps the fixture honest about what is being exercised
 * rather than constructing a router to produce it.
 */
const segmentsFor = (paths: string[]) =>
  paths.map((path) => ({ path })) as unknown as UrlSegment[];

describe('normalizePagePath', () => {
  it('leaves a well-formed path alone', () => {
    expect(normalizePagePath('/nutrition')).toBe('/nutrition');
    expect(normalizePagePath('/about/careers')).toBe('/about/careers');
  });

  it('resolves an empty path to the home page', () => {
    expect(normalizePagePath('')).toBe('/');
    expect(normalizePagePath('/')).toBe('/');
  });

  it('adds the leading slash a route snapshot does not carry', () => {
    // `ActivatedRouteSnapshot.url` holds bare segments, so the joined form
    // arrives without one.
    expect(normalizePagePath('nutrition')).toBe('/nutrition');
  });

  it('lowercases, because Strapi stores paths lowercase', () => {
    // Without this, `/Nutrition` 404s on a page that exists.
    expect(normalizePagePath('/Nutrition')).toBe('/nutrition');
  });

  it('drops a trailing slash', () => {
    expect(normalizePagePath('/nutrition/')).toBe('/nutrition');
  });

  it('collapses repeated separators rather than querying for an empty segment', () => {
    expect(normalizePagePath('//about//careers//')).toBe('/about/careers');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizePagePath('  /nutrition  ')).toBe('/nutrition');
  });
});

describe('pagePathFromSegments', () => {
  it('joins every segment a catch-all route matched', () => {
    // A `**` route puts the whole unmatched path in `url`, which is why a
    // nested page needs no extra route config.
    expect(pagePathFromSegments(segmentsFor(['about', 'careers']))).toBe(
      '/about/careers',
    );
  });

  it('resolves a bare match to the home page', () => {
    expect(pagePathFromSegments(segmentsFor([]))).toBe('/');
  });

  it('normalises what it finds', () => {
    expect(pagePathFromSegments(segmentsFor(['Nutrition']))).toBe('/nutrition');
  });
});
