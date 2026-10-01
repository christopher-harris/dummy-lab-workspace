import { Component } from '@angular/core';
import { LandingAnnouncementBarComponent } from './components/landing-announcement-bar/landing-announcement-bar.component';
import { NavbarComponent } from '../../components/layout/navbar/navbar.component';
import { LandingHeroComponent } from './components/landing-hero/landing-hero.component';
import { LandingFeaturesComponent } from './components/landing-features/landing-features.component';
import { LandingCtaBannerComponent } from './components/landing-cta-banner/landing-cta-banner.component';
import { LandingStatsComponent } from './components/landing-stats/landing-stats.component';
import { LandingTrustedByComponent } from './components/landing-trusted-by/landing-trusted-by.component';
import { LandingArticlesComponent } from './components/landing-articles/landing-articles.component';
import { LandingPricingComponent } from './components/landing-pricing/landing-pricing.component';
import { LandingContactComponent } from './components/landing-contact/landing-contact.component';

@Component({
  selector: 'dl-landing',
  imports: [
    LandingAnnouncementBarComponent,
    NavbarComponent,
    LandingHeroComponent,
    LandingFeaturesComponent,
    LandingCtaBannerComponent,
    LandingStatsComponent,
    LandingTrustedByComponent,
    LandingArticlesComponent,
    LandingPricingComponent,
    LandingContactComponent,
  ],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css',
})
export class Landing1 {}
