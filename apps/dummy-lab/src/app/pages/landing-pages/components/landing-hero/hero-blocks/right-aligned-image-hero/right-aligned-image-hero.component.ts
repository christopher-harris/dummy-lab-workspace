import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

export interface HeroImage {
  src: string;
  alt: string;
}

export interface RightAlignedImageContent {
  headline: string;
  /** Second headline line, rendered in the primary colour. */
  headlineAccent: string;
  description: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  image: HeroImage;
}

const CDN =
  'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks';

@Component({
  selector: 'right-aligned-image',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './right-aligned-image-hero.component.html',
  styleUrl: './right-aligned-image-hero.component.css',
})
export class RightAlignedImage {
  readonly content = signal<RightAlignedImageContent>({
    headline: 'Hot wings, straight',
    headlineAccent: 'to your door',
    description:
      'Carryout in minutes or delivery to your couch — cooked to order, tossed when you order, never sitting under a heat lamp.',
    primaryCtaLabel: 'Order Delivery',
    secondaryCtaLabel: 'Find a Location',
    image: {
      src: `${CDN}/hero/hero-1.png`,
      alt: 'Wingstop carryout bag on a counter beside a basket of wings and a drink',
    },
  });
}
