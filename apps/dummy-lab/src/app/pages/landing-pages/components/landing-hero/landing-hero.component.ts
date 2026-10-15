import { NgComponentOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { CarouselModule, CarouselPassThroughOptions } from 'primeng/carousel';
import { ContentStore } from '@dummy-lab/data-access-content';
import { toBlockInputs } from '@dummy-lab/shared-models';
import { getContentBlockEntry } from '@dummy-lab/feature-content-blocks';

@Component({
  selector: 'dl-landing-hero',
  imports: [CarouselModule, NgComponentOutlet],
  templateUrl: './landing-hero.component.html',
  styleUrl: './landing-hero.component.css',
})
export class LandingHeroComponent {
  private readonly content = inject(ContentStore);

  /**
   * `flex flex-col` — equal-height slides. PrimeNG lays the items out as a flex
   * row and hides inactive ones with `visibility: hidden` rather than
   * `display: none`, so every item is already stretched to the tallest slide.
   * The missing link is the item being `display: block`, which leaves each block
   * at its natural height inside a taller item; a column lets the block's host
   * take the full height (see each block's `:host { flex: 1 }`).
   *
   * `visible` — works around a PrimeNG bug in the circular autoplay wrap. On the
   * last page autoplay calls `step(-1, 0)`, which forces `totalShiftedItems` to
   * `-(value.length + numVisible)`, scrolling to the finishing clone.
   * `onTransitionEnd` then adds `p-items-hidden` and recomputes the transform
   * from that same offset, so it never normalises back to the real first item.
   * At that offset neither the clone nor anything on screen is marked active, so
   * `.p-items-hidden .p-carousel-item { visibility: hidden }` blanks the slot
   * until the next tick. Keeping items visible lets the clone — a pixel copy of
   * the first hero — stay on screen instead. Harmless with `numVisible` 1: the
   * viewport clips to one slide anyway, and `aria-hidden` still tracks the
   * active item for screen readers. It also defuses `transitionend` bubbling out
   * of a slide (a hovered CTA) and tripping the same handler.
   *
   * `basis-full shrink-0 grow` — the `flex: 1 0 100%` PrimeNG gives each item
   * for `numVisible` 1, but in the prerendered HTML. PrimeNG writes that rule
   * into a `<style>` from `createStyle()`, which only runs in the browser, so
   * the static page painted every slide squeezed into one row and then
   * reflowed them all to full width once scripts ran — 0.42 of desktop CLS
   * on stage (Lighthouse, 15 Oct 2026). Squeezed, every slide also sat inside
   * the viewport, so the lazy hero images loaded at once and competed with
   * the LCP image. PrimeNG's rule still lands later; it's the same value.
   *
   * `item` and `itemClone` both need these because `[circular]="true"` renders
   * clones at either end. Utility classes win over PrimeNG's own rules here: the
   * workspace sets the cssLayer order to `theme, base, primeng, utilities` in
   * `PRIMENG_THEME_OPTIONS`.
   */
  readonly carouselPt: CarouselPassThroughOptions = {
    content: 'items-stretch',
    itemList: 'items-stretch',
    item: 'flex flex-col visible basis-full shrink-0 grow',
    itemClone: 'flex flex-col visible basis-full shrink-0 grow',
  };

  /**
   * Milliseconds between slides. PrimeNG only honours this on the legacy
   * `[value]` carousel — the composition API (`p-carousel-content`) has no
   * autoplay — which is why the template uses `[value]` + `#item`.
   */
  readonly autoplayInterval = computed(
    () => this.content.landingPageValue()?.data?.heroAutoplayInterval ?? 6000,
  );

  /**
   * One carousel item per hero block the CMS returned, in the dynamic zone's
   * order, resolved to a component through the block registry.
   *
   * Two kinds of block are dropped rather than rendered as a gap, on the same
   * reasoning: a carousel short one slide beats a broken page.
   *
   * - one this build has no component for — Strapi can gain a block type
   *   before the frontend ships one;
   * - one whose `content` component did not come back, which Strapi reports
   *   as `null` with a 200. A block template reads `content().headline`
   *   directly, so rendering it would throw and take every other slide down
   *   with it.
   *
   * The trade is that the missing block is invisible — nothing on the page
   * says a slide was skipped. Surfacing that is PROVE-OUT P24's job.
   *
   * `toBlockInputs` builds the input object rather than an inline literal:
   * `ngComponentOutletInputs` is `Record<string, unknown>`, so this is the only
   * place the content/settings pair gets type-checked against the block it came
   * from. It is also what turns an unfilled `settings` component into the
   * frontend default — a component `input()` default only applies when the key
   * is absent, and this always passes it.
   */
  readonly slides = computed(() => {
    const blocks = this.content.landingPageValue()?.data?.heroSlides ?? [];

    return blocks.flatMap((block) => {
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
}
