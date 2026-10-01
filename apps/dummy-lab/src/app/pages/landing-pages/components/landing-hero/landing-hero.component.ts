import { NgComponentOutlet } from '@angular/common';
import { Component, signal, Type } from '@angular/core';
import { CarouselModule, CarouselPassThroughOptions } from 'primeng/carousel';
import { CenteredProductImage } from './hero-blocks/centered-product-image-hero/centered-product-image-hero.component';
import { DarkImageBackground } from './hero-blocks/dark-image-background-hero/dark-image-background-hero.component';
import { LightImageBackground } from './hero-blocks/light-image-background-hero/light-image-background-hero.component';
import { RightAlignedImage } from './hero-blocks/right-aligned-image-hero/right-aligned-image-hero.component';

export interface HeroSlide {
  /** Stable key for `track`; also handy as a CMS variant id later. */
  id: string;
  /** Block rendered for this slide. Each block owns its own copy and artwork. */
  component: Type<unknown>;
}

@Component({
  selector: 'dl-landing-hero',
  imports: [CarouselModule, NgComponentOutlet],
  templateUrl: './landing-hero.component.html',
  styleUrl: './landing-hero.component.css',
})
export class LandingHeroComponent {
  /**
   * Milliseconds between slides. PrimeNG only honours this on the legacy
   * `[value]` carousel — the composition API (`p-carousel-content`) has no
   * autoplay — which is why the template uses `[value]` + `#item`.
   */
  readonly autoplayInterval = 6000;

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
   * `-(value.length + numVisible)` = -5 here, scrolling to the finishing clone.
   * `onTransitionEnd` then adds `p-items-hidden` and recomputes the transform
   * from that same -5, so it never normalises back to the real first item. At
   * that offset neither the clone (`-totalShiftedItems === value.length` is
   * `5 === 4`) nor anything on screen is marked active, so
   * `.p-items-hidden .p-carousel-item { visibility: hidden }` blanks the slot
   * until the next tick. Keeping items visible lets the clone — a pixel copy of
   * the first hero — stay on screen instead. Harmless with `numVisible` 1: the
   * viewport clips to one slide anyway, and `aria-hidden` still tracks the
   * active item for screen readers. It also defuses `transitionend` bubbling out
   * of a slide (a hovered CTA) and tripping the same handler.
   *
   * `item` and `itemClone` both need these because `[circular]="true"` renders
   * clones at either end. Utility classes win over PrimeNG's own rules here: the
   * workspace sets the cssLayer order to `theme, base, primeng, utilities` in
   * `PRIMENG_THEME_OPTIONS`.
   */
  readonly carouselPt: CarouselPassThroughOptions = {
    content: 'items-stretch',
    itemList: 'items-stretch',
    item: 'flex flex-col visible',
    itemClone: 'flex flex-col visible',
  };

  readonly slides = signal<HeroSlide[]>([
    { id: 'flavors', component: CenteredProductImage },
    { id: 'delivery', component: RightAlignedImage },
    { id: 'app', component: LightImageBackground },
    { id: 'drops', component: DarkImageBackground },
  ]);
}
