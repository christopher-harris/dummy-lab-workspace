import { NgComponentOutlet } from '@angular/common';
import { Component, computed, effect, inject, type Type } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import {
  pagePathFromSegments,
  pagesEvents,
  PagesStore,
} from '@dummy-lab/data-access-pages';
import { injectDispatch } from '@ngrx/signals/events';
import { toBlockInputs } from '@dummy-lab/shared-models';
import { CmsMediaUrl, getContentBlockEntry } from '@dummy-lab/ui-content-blocks';

import { NavbarComponent } from '../../components/layout/navbar/navbar.component';

/**
 * One block, reduced to what `NgComponentOutlet` can actually consume.
 *
 * `component` is widened to `Type<unknown>` on purpose. `ContentBlockRegistry`
 * types each entry's component invariantly against its own content type, which
 * is what makes registering a component under the wrong key a compile error —
 * but it also means `entry.component` is a *union* of four unrelated
 * `Type<ContentBlockComponent<…>>`, and `NgComponentOutlet<T>` infers a single
 * `T` from `Type<T>`. The union fails against whichever member it picked
 * first.
 *
 * Widening here is safe because the registry already did its work at lookup
 * time: `getContentBlockEntry` pairs the component with the matching content,
 * and `toBlockInputs` type-checks that pair. Past this point the specific type
 * carries no information anyway — `ngComponentOutletInputs` is
 * `Record<string, unknown>`.
 *
 * The landing hero avoids the error rather than solving it: its outlet sits
 * inside a PrimeNG `ng-template` whose `let-slide` is implicitly `any`, so the
 * union never reaches the template type-checker.
 */
interface RenderableBlock {
  readonly id: string;
  readonly component: Type<unknown>;
  readonly inputs: Record<string, unknown>;
}

/**
 * Renders the `Page` row matching the current URL.
 *
 * Asks for the page, then only reads. `PagesStore` owns the request, so
 * `pageIsLoading`, `pageError` and `pageNotFound` are resource state rather
 * than local flags and there is nothing here to keep in sync.
 *
 * The request is started from the constructor, not from a route resolver.
 * Two reasons, both of which produced a silently dead page when it was a
 * resolver:
 *
 * 1. `@ngrx/signals/events` dispatches through a plain `Subject`, so an event
 *    published before a store is first injected reaches nobody. A resolver
 *    runs before this component exists, which means before anything has
 *    injected `PagesStore` — the dispatch vanished and no request was ever
 *    made. Injecting the store here first makes the ordering explicit.
 * 2. A `**` route produces no params, and the router's default
 *    `runGuardsAndResolvers` is `paramsChange`. A resolver therefore would not
 *    re-run when one CMS page navigates to another, so the page would never
 *    change. `ActivatedRoute.url` emits on every navigation.
 */
@Component({
  selector: 'dl-cms-page',
  imports: [NavbarComponent, NgComponentOutlet],
  templateUrl: './cms.page.html',
})
export class CmsPage {
  protected readonly pages = inject(PagesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly dispatch = injectDispatch(pagesEvents);
  private readonly media = inject(CmsMediaUrl);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  /**
   * One rendered component per block, in the dynamic zone's order.
   *
   * Identical dropping rules to the landing hero, for the same reasons: a
   * block this build has no component for (Strapi can gain a block type before
   * the frontend ships one), and a block whose `content` came back `null`
   * (the component-restructure defect, which Strapi reports with a 200).
   * Rendering either one throws and takes the whole page down.
   */
  protected readonly blocks = computed<RenderableBlock[]>(() => {
    const page = this.pages.currentPage();

    return (page?.blocks ?? []).flatMap((block) => {
      const entry = getContentBlockEntry(block.__component);

      if (!entry) {
        return [];
      }

      const inputs = toBlockInputs(block);

      if (!inputs) {
        return [];
      }

      return [
        {
          id: `${block.__component}-${block.id}`,
          component: entry.component,
          inputs,
        },
      ];
    });
  });

  constructor() {
    // Subscribed rather than run through an `effect` so the request starts
    // during construction: `url` replays its current value synchronously on
    // subscribe, where an effect would not run until after the first render.
    this.route.url
      .pipe(takeUntilDestroyed())
      .subscribe((segments) =>
        this.dispatch.pageRequested(pagePathFromSegments(segments)),
      );

    effect(() => {
      const page = this.pages.currentPage();

      if (page === undefined) {
        if (this.pages.pageNotFound()) {
          this.title.setTitle('Page not found');
          this.meta.updateTag({ name: 'robots', content: 'noindex' });
        }

        return;
      }

      const { seo } = page;

      this.title.setTitle(seo.metaTitle);
      this.meta.updateTag({
        name: 'description',
        content: seo.metaDescription,
      });
      this.meta.updateTag({ property: 'og:title', content: seo.metaTitle });
      this.meta.updateTag({
        property: 'og:description',
        content: seo.metaDescription,
      });

      const ogImage = this.media.resolve(seo.ogImage);

      if (ogImage) {
        this.meta.updateTag({ property: 'og:image', content: ogImage });
      } else {
        this.meta.removeTag("property='og:image'");
      }

      // Written on every resolution rather than only when true: `removeTag` is
      // what un-hides a page that was `noindex` a navigation ago. A stale
      // `robots` tag is worse than a missing one.
      if (seo.noindex) {
        this.meta.updateTag({ name: 'robots', content: 'noindex' });
      } else {
        this.meta.removeTag("name='robots'");
      }
    });
  }
}
