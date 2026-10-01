import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

export interface DarkImageBackgroundContent {
  headline: string;
  /** Second headline line, rendered in the primary colour. */
  headlineAccent: string;
  description: string;
  emailPlaceholder: string;
  ctaLabel: string;
  /** Photo layered under the gradient stack by `backgroundStyle`. */
  backgroundImage: string;
}

const CDN =
  'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks';

@Component({
  selector: 'dark-image-background',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: './dark-image-background-hero.component.html',
  styleUrl: './dark-image-background-hero.component.css',
})
export class DarkImageBackground {
  email = '';

  readonly content = signal<DarkImageBackgroundContent>({
    headline: 'Never Miss',
    headlineAccent: 'A Flavor Drop',
    description:
      'Limited-run flavors, rewards bonuses, and deals land in your inbox before they hit the menu board.',
    emailPlaceholder: 'Enter your email',
    ctaLabel: 'Notify Me',
    backgroundImage: `${CDN}/hero/bw-hero-bg.jpg`,
  });

  /** Four stacked layers; `backgroundBlendMode` below pairs with them in order. */
  readonly backgroundStyle = computed(() => ({
    background: `linear-gradient(0deg, color-mix(in srgb, var(--p-surface-950) 50%, transparent) 0%, transparent 100%),
                    linear-gradient(0deg, var(--p-primary-500) 0%, var(--p-primary-500) 100%),
                    linear-gradient(0deg, color-mix(in srgb, var(--p-primary-800) 60%, transparent) 0%, color-mix(in srgb, var(--p-primary-800) 60%, transparent) 100%),
                    url('${this.content().backgroundImage}') center/cover no-repeat`,
    backgroundBlendMode: 'normal, multiply, lighten, normal',
  }));
}
