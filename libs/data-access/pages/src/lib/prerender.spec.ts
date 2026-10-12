import { pagePathsUrl } from './prerender';

const CMS = 'http://localhost:1337';

const query = (url: string) => decodeURIComponent(url.split('?')[1] ?? '');

describe('pagePathsUrl', () => {
  it('asks only for the fields a manifest needs', () => {
    const params = query(pagePathsUrl(CMS));

    expect(params).toContain('fields[0]=path');
    // A sitemap must not list `noindex` pages, so the flag travels with the
    // path rather than requiring a second request per page.
    expect(params).toContain('populate[seo][fields][0]=noindex');
  });

  it('does not populate blocks — nothing here renders a page', () => {
    expect(query(pagePathsUrl(CMS))).not.toContain('populate[blocks]');
  });

  it('paginates explicitly so a caller cannot silently prerender only the first page', () => {
    expect(query(pagePathsUrl(CMS))).toContain('pagination[page]=1');
    expect(query(pagePathsUrl(CMS))).toContain('pagination[pageSize]=100');
    expect(query(pagePathsUrl(CMS, 3, 25))).toContain('pagination[page]=3');
    expect(query(pagePathsUrl(CMS, 3, 25))).toContain('pagination[pageSize]=25');
  });

  it('orders deterministically, so two builds produce the same manifest', () => {
    expect(query(pagePathsUrl(CMS))).toContain('sort[0]=path:asc');
  });
});
