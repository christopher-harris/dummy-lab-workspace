import { DOCUMENT, inject, InjectionToken } from '@angular/core';

/** Which version of a document the CMS should return. */
export type CmsStatus = 'draft' | 'published';

export interface CmsPreview {
  /**
   * Whether this page was opened from the CMS preview pane. Separate from
   * `status` because previewing the *published* version is still a preview
   * render — it must not be indexed, even though its content is identical to
   * the live page.
   */
  readonly active: boolean;
  readonly status: CmsStatus;
}

export const NO_PREVIEW: CmsPreview = Object.freeze({
  active: false,
  status: 'published',
});

/**
 * Reads the preview contract out of a query string.
 *
 * Strapi's preview handler (`apps/cms/config/admin.ts`) opens the frontend at
 * `/?preview=true&status=<draft|published>`. Anything else — a normal visit, a
 * shared link, a crawler — resolves to the published page.
 *
 * Exported separately from the token so it can be tested without a DOM.
 */
export function readCmsPreview(search: string): CmsPreview {
  const params = new URLSearchParams(search);

  if (params.get('preview') !== 'true') {
    return NO_PREVIEW;
  }

  return {
    active: true,
    status: params.get('status') === 'published' ? 'published' : 'draft',
  };
}

/**
 * Resolved once at startup rather than tracked as a signal: the preview pane
 * is an iframe that reloads on every open, so there is no in-page transition
 * into or out of preview to react to.
 *
 * A token rather than a service so tests and a future server-resolved preview
 * (PROVE-OUT P23) can replace it without touching the store.
 */
export const CMS_PREVIEW = new InjectionToken<CmsPreview>('CMS_PREVIEW', {
  providedIn: 'root',
  factory: () => readCmsPreview(inject(DOCUMENT).location.search),
});
