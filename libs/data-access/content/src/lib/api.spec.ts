import { landingPageUrl } from './api';

const CMS = 'http://localhost:1337';

const query = (url: string) => decodeURIComponent(url.split('?')[1] ?? '');

describe('landingPageUrl', () => {
  it('targets the landing-page single type on the configured origin', () => {
    expect(landingPageUrl(CMS).startsWith(`${CMS}/api/landing-page?`)).toBe(
      true,
    );
  });

  it('names the heroSlides zone, which is what asks the controller to deepen it', () => {
    // The `landing-page` controller expands only a dynamic zone the caller
    // named, reading the component list and every nested component and media
    // field off the schema. This one key is the entire block request.
    expect(query(landingPageUrl(CMS))).toContain('populate[heroSlides]=true');
  });

  it('names no component uid at all', () => {
    // This file used to carry a per-block populate map, duplicated almost
    // exactly in `data-access/pages`. Both were whitelists, and a whitelist
    // silently drops the block it has not been told about.
    const params = query(landingPageUrl(CMS));

    expect(params).not.toContain('[on]');
    expect(params).not.toContain('hero.');
  });

  it('does not fall back to a wildcard populate', () => {
    // `populate=*` reaches one level. Since the content/settings split that
    // returns `content` with its scalars and without its media, so every hero
    // would render without its background image.
    expect(query(landingPageUrl(CMS))).not.toContain('=*');
  });

  it('omits `status` for a normal visit, so the published page is cached plainly', () => {
    expect(query(landingPageUrl(CMS))).not.toContain('status=');
  });

  it('asks for the draft version in preview', () => {
    expect(query(landingPageUrl(CMS, 'draft'))).toContain('status=draft');
  });

  it('keeps the block populate in preview, so the draft renders like the real page', () => {
    expect(query(landingPageUrl(CMS, 'draft'))).toContain(
      'populate[heroSlides]=true',
    );
  });
});
