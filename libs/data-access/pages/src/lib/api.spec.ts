import { pageByPathUrl } from './api';

const CMS = 'http://localhost:1337';

const query = (url: string) => decodeURIComponent(url.split('?')[1] ?? '');

describe('pageByPathUrl', () => {
  it('targets the pages collection on the configured origin', () => {
    expect(
      pageByPathUrl(CMS, '/nutrition').startsWith(`${CMS}/api/pages?`),
    ).toBe(true);
  });

  it('filters on the exact path', () => {
    // `$eq`, not `$startsWith` or `$contains`: `/nutrition` must never match
    // `/nutrition-facts`, and a prefix match on a path is the kind of bug that
    // serves the wrong page rather than failing.
    expect(query(pageByPathUrl(CMS, '/nutrition'))).toContain(
      'filters[path][$eq]=/nutrition',
    );
  });

  it('round-trips a nested path without mangling the separators', () => {
    expect(query(pageByPathUrl(CMS, '/about/careers'))).toContain(
      'filters[path][$eq]=/about/careers',
    );
  });

  it('populates the SEO component, including its image relation', () => {
    // Scalars of a populated component come back by default; `ogImage` is a
    // relation and has to be named or the page renders with no social image.
    // `seo` is a plain component, not a dynamic zone, so the controller does
    // not touch it and it stays fully specified here.
    expect(query(pageByPathUrl(CMS, '/'))).toContain(
      'populate[seo][populate][0]=ogImage',
    );
  });

  it('names the blocks zone, which is what asks the controller to deepen it', () => {
    // The `page` controller only expands a dynamic zone the caller named. This
    // single key is the whole request for block content.
    expect(query(pageByPathUrl(CMS, '/'))).toContain('populate[blocks]=true');
  });

  it('names no component uid at all', () => {
    // The point of the whole exercise. A query that enumerates components is a
    // whitelist, and a whitelist drops the block it was never told about — the
    // `/nutrition` failure. Depth is the server's job, derived from the schema.
    const params = query(pageByPathUrl(CMS, '/'));

    expect(params).not.toContain('[on]');
    expect(params).not.toContain('hero.');
    expect(params).not.toContain('nutrition.');
  });

  it('does not fall back to a wildcard populate', () => {
    // `populate=*` reaches one level, which since the content/settings split
    // returns a block with its scalars and without its media or nested
    // components — `categories` and `pdf` on the nutrition table. The
    // controller deliberately ignores a top-level wildcard, so asking for one
    // here would quietly return less.
    expect(query(pageByPathUrl(CMS, '/'))).not.toContain('=*');
  });

  it('omits `status` for a normal visit, so the published page is cached plainly', () => {
    expect(query(pageByPathUrl(CMS, '/'))).not.toContain('status=');
  });

  it('asks for the draft version in preview', () => {
    expect(query(pageByPathUrl(CMS, '/', 'draft'))).toContain('status=draft');
  });

  it('keeps the full populate in preview, so the draft renders like the real page', () => {
    const params = query(pageByPathUrl(CMS, '/', 'draft'));

    expect(params).toContain('populate[blocks]=true');
    expect(params).toContain('populate[seo][populate][0]=ogImage');
  });
});
