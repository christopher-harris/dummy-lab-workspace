import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

export interface HeroLink {
  /** PrimeIcons class, e.g. `pi pi-apple`. */
  icon: string;
  href: string;
}

export interface LightImageBackgroundContent {
  headline: string;
  /** Second headline line, rendered in the primary colour. */
  headlineAccent: string;
  description: string;
  ctaLabel: string;
  availabilityNote: string;
  links: HeroLink[];
  /** Photo layered under the radial scrim by `backgroundStyle`. */
  backgroundImage: string;
}

const CDN =
  'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks';

@Component({
  selector: 'light-image-background',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './light-image-background-hero.component.html',
  styleUrl: './light-image-background-hero.component.css',
})
export class LightImageBackground {
  readonly content = signal<LightImageBackgroundContent>({
    headline: 'Order Faster With',
    headlineAccent: 'The Wingstop App',
    description:
      'Save your go-to flavors, reorder in two taps, and track your wings from the fryer to the front door.',
    ctaLabel: 'Get the App',
    availabilityNote: 'Available on iOS and Android',
    links: [
      { icon: 'pi pi-apple', href: 'https://www.apple.com' },
      { icon: 'pi pi-android', href: 'https://play.google.com' },
      { icon: 'pi pi-facebook', href: 'https://www.facebook.com' },
    ],
    backgroundImage: `${CDN}/hero/heroWithImage-bg.jpg`,
  });

  /** Radial scrim over the photo, so the white headline stays readable. */
  readonly backgroundStyle = computed(() => ({
    background: `radial-gradient(67.46% 67.46% at 50% 50%, color-mix(in srgb, var(--p-surface-950) 60%, transparent) 0%, rgba(0, 0, 0, 0) 100%),
                    url('${this.content().backgroundImage}') lightgray 50% / cover no-repeat`,
  }));
}
