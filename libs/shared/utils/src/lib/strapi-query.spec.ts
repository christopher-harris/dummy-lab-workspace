import { describe, expect, it } from 'vitest';

import { strapiQuery } from './strapi-query';

/**
 * Every expectation below is the literal output of
 * `qs.stringify(input, { encodeValuesOnly: true })`, captured from `qs@6.16.0`
 * rather than written from memory. That is the contract: this module is a
 * stand-in for the serialiser the Strapi docs use, so the test is a
 * differential against it, not a description of what seemed reasonable.
 *
 * `qs` is deliberately *not* imported here. It is a transitive dependency of
 * dev tooling, not a declared one, and making a spec rely on it would quietly
 * re-create the coupling this module exists to avoid.
 */
describe('strapiQuery', () => {
  it('brackets each level of a nested object', () => {
    expect(strapiQuery({ filters: { path: { $eq: '/nutrition' } } })).toBe(
      'filters[path][$eq]=%2Fnutrition',
    );
  });

  it('indexes arrays', () => {
    expect(strapiQuery({ fields: ['path', 'title'] })).toBe(
      'fields[0]=path&fields[1]=title',
    );
  });

  it('serialises booleans and numbers as bare values', () => {
    expect(strapiQuery({ populate: { seo: true } })).toBe('populate[seo]=true');
    expect(strapiQuery({ pagination: { page: 2, pageSize: 100 } })).toBe(
      'pagination[page]=2&pagination[pageSize]=100',
    );
  });

  it('encodes values but never keys', () => {
    // The whole point of `encodeValuesOnly`. `$` in an operator and `.` in a
    // component UID have to arrive at Strapi literally; a path separator in a
    // value has to arrive encoded.
    expect(strapiQuery({ filters: { path: { $eq: '/about/careers' } } })).toBe(
      'filters[path][$eq]=%2Fabout%2Fcareers',
    );
    expect(strapiQuery({ sort: ['path:asc'] })).toBe('sort[0]=path%3Aasc');
  });

  it('leaves a dotted component UID intact as a key', () => {
    expect(
      strapiQuery({
        populate: {
          blocks: {
            on: {
              'hero.dark-image-background': { populate: { settings: true } },
            },
          },
        },
      }),
    ).toBe(
      'populate[blocks][on][hero.dark-image-background][populate][settings]=true',
    );
  });

  it('recurses into objects inside arrays', () => {
    expect(strapiQuery({ filters: { $or: [{ a: 1 }, { b: 2 }] } })).toBe(
      'filters[$or][0][a]=1&filters[$or][1][b]=2',
    );
  });

  it('emits keys in the order they were written', () => {
    // Pinned because the populate specs in `data-access/pages` and
    // `data-access/content` assert against whole URL fragments, and a
    // reordering here would read as those queries changing.
    expect(
      strapiQuery({
        filters: { path: { $eq: '/' } },
        status: 'draft',
        populate: { seo: { populate: ['ogImage'] } },
      }),
    ).toBe(
      'filters[path][$eq]=%2F&status=draft&populate[seo][populate][0]=ogImage',
    );
  });

  it('drops an undefined value rather than emitting an empty one', () => {
    // This is what lets a caller write `status: isDraft ? 'draft' : undefined`
    // inline instead of spreading a conditional object in.
    expect(strapiQuery({ status: undefined, fields: ['path'] })).toBe(
      'fields[0]=path',
    );
  });

  it('drops null as well, which is the one place it diverges from qs', () => {
    // `qs` renders `null` as `status=`. Strapi reads that as a malformed
    // value rather than as an absent one, so both empties are dropped here.
    // Documented in `strapi-query.ts`; asserted so the divergence is a
    // decision rather than a surprise.
    expect(strapiQuery({ status: null, fields: ['path'] })).toBe(
      'fields[0]=path',
    );
  });

  it('returns an empty string when there is nothing to send', () => {
    expect(strapiQuery({})).toBe('');
    expect(strapiQuery({ populate: {} })).toBe('');
    expect(strapiQuery({ fields: [] })).toBe('');
    expect(strapiQuery({ status: undefined })).toBe('');
  });
});
