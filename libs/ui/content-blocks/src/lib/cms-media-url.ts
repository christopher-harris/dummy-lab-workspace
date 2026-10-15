import { inject, Injectable, Pipe, PipeTransform } from '@angular/core';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import type { StrapiMedia } from '@dummy-lab/shared-models';

import type { CmsImage, CmsImageRendition } from './cms-image';

/**
 * Resolves a `StrapiMedia.url` against the CMS origin.
 *
 * Strapi's local upload provider returns root-relative URLs, which would
 * otherwise resolve against the Angular dev server and 404. S3 and CDN
 * providers return absolute URLs, which `new URL` passes through untouched, so
 * this is safe to call without knowing which provider is configured.
 *
 * A service as well as a pipe because two blocks compose the image into a CSS
 * `background` layer in TypeScript, where a pipe cannot reach.
 */
@Injectable({ providedIn: 'root' })
export class CmsMediaUrl {
  private readonly cmsBaseUrl = inject(RUNTIME_CONFIG).cmsBaseUrl;

  resolve(media: StrapiMedia | null | undefined): string {
    const url = media?.url ?? '';
    return url ? new URL(url, this.cmsBaseUrl).toString() : '';
  }

  /**
   * An image's stored renditions, for `<img ngSrc>` or a CSS background.
   *
   * **The original upload is left out whenever Strapi made smaller formats.**
   * Strapi keeps the file exactly as uploaded, and editors upload camera and
   * stock originals: the landing page's three heroes were 1.5–4.5 MB each,
   * about 9 MB in all, and took mobile LCP from 7 s to 21.7 s (Lighthouse,
   * 15 Oct 2026). Strapi only skips a format when the original is narrower
   * than it, so the formats always cover up to the largest breakpoint (1000px
   * by default). Sharper art on wide screens means adding a breakpoint in the
   * CMS's upload config, not falling back to the original here.
   *
   * The original is used only when there are no formats, which is what
   * Strapi does for SVGs and images narrower than its smallest breakpoint.
   *
   * `null` when there is no media, or no rendition with a known width to put
   * in a `srcset`.
   */
  image(media: StrapiMedia | null | undefined): CmsImage | null {
    if (!media?.url) {
      return null;
    }

    const formats = Object.values(media.formats ?? {});
    const stored = formats.length
      ? formats
      : [{ url: media.url, width: media.width }];

    const renditions: CmsImageRendition[] = stored
      .filter((format) => format.width > 0)
      .map((format) => ({
        url: new URL(format.url, this.cmsBaseUrl).toString(),
        width: format.width,
      }))
      .sort((a, b) => a.width - b.width);

    const widest = renditions[renditions.length - 1];

    if (!widest) {
      return null;
    }

    return {
      src: widest.url,
      srcset: renditions.map((rendition) => `${rendition.width}w`).join(', '),
      alt: media.alternativeText ?? '',
      loaderParams: { renditions },
    };
  }
}

@Pipe({ name: 'cmsMediaUrl' })
export class CmsMediaUrlPipe implements PipeTransform {
  private readonly cmsMediaUrl = inject(CmsMediaUrl);

  transform(media: StrapiMedia | null | undefined): string {
    return this.cmsMediaUrl.resolve(media);
  }
}
