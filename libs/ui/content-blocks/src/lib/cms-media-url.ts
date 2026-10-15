import { inject, Injectable, Pipe, PipeTransform } from '@angular/core';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import type { StrapiMedia } from '@dummy-lab/shared-models';

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
}

@Pipe({ name: 'cmsMediaUrl' })
export class CmsMediaUrlPipe implements PipeTransform {
  private readonly cmsMediaUrl = inject(CmsMediaUrl);

  transform(media: StrapiMedia | null | undefined): string {
    return this.cmsMediaUrl.resolve(media);
  }
}
