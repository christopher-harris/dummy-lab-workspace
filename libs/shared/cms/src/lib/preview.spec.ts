import { NO_PREVIEW, readCmsPreview } from './preview';

describe('readCmsPreview', () => {
  it('treats a normal visit as published', () => {
    expect(readCmsPreview('')).toBe(NO_PREVIEW);
    expect(readCmsPreview('?utm_source=newsletter')).toBe(NO_PREVIEW);
  });

  it('reads the draft contract the Strapi handler opens', () => {
    // apps/cms/config/admin.ts builds exactly this.
    expect(readCmsPreview('?preview=true&status=draft')).toEqual({
      active: true,
      status: 'draft',
    });
  });

  it('stays in preview when the editor is viewing the published version', () => {
    // Still a preview render, so still not indexable — which is why `active`
    // is tracked separately from `status`.
    expect(readCmsPreview('?preview=true&status=published')).toEqual({
      active: true,
      status: 'published',
    });
  });

  it('defaults to draft when the handler sent no status', () => {
    expect(readCmsPreview('?preview=true')).toEqual({
      active: true,
      status: 'draft',
    });
  });

  it('ignores a status that was not asked for in preview mode', () => {
    expect(readCmsPreview('?status=draft')).toBe(NO_PREVIEW);
  });

  it('does not accept a truthy-looking preview flag', () => {
    // `preview=1` or `preview` alone must not open draft content to a visitor
    // who guessed at the query string.
    expect(readCmsPreview('?preview=1')).toBe(NO_PREVIEW);
    expect(readCmsPreview('?preview')).toBe(NO_PREVIEW);
    expect(readCmsPreview('?preview=TRUE')).toBe(NO_PREVIEW);
  });
});
