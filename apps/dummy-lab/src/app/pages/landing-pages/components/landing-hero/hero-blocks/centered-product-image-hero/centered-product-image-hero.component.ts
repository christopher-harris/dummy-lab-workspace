import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ThemeStore } from '@dummy-lab/data-access-theme';

export interface HeroImage {
  src: string;
  alt: string;
}

export interface CenteredProductImageContent {
  /** Pill above the headline. */
  eyebrow: string;
  headline: string;
  /** Second headline line, rendered in the primary colour. */
  headlineAccent: string;
  ctaLabel: string;
  /** The same artwork in both themes; CSS swaps which one is visible. */
  image: {
    light: HeroImage;
    dark: HeroImage;
  };
}

const CDN =
  'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks';

@Component({
  selector: 'centered-product-image',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './centered-product-image-hero.component.html',
  styleUrl: './centered-product-image-hero.component.css',
})
export class CenteredProductImage {
  private readonly theme = inject(ThemeStore);

  /**
   * This is the page's LCP element, so it renders as a single `<img>` rather
   * than a light/dark pair toggled with `dark:hidden`. A `display: none` image
   * is still fetched, so the pair cost ~162 KiB to show ~81 KiB of it. Reading
   * `isDark()` also keeps the swap tied to the in-app theme toggle — a
   * `<picture>` with `prefers-color-scheme` would desync from it, because the
   * theme store drives a class on `<html>`, not the OS setting.
   */
  readonly heroImage = computed(() =>
    this.theme.isDark()
      ? this.content().image.dark
      : this.content().image.light,
  );

  readonly content = signal<CenteredProductImageContent>({
    eyebrow: '🔥 12 signature flavors',
    headline: 'Where Flavor',
    headlineAccent: 'Gets Its Wings',
    ctaLabel: 'Order Now',
    image: {
      light: {
        src: `${CDN}/hero/hero-product.jpg`,
        alt: 'Classic wings tossed in Lemon Pepper, served with seasoned fries and ranch',
      },
      dark: {
        src: `${CDN}/hero/hero-product-dark.jpg`,
        alt: 'Classic wings tossed in Lemon Pepper, served with seasoned fries and ranch',
      },
    },
  });
}
