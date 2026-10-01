import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'dl-landing-pricing',
  imports: [FormsModule, ButtonModule, ToggleSwitchModule],
  templateUrl: './landing-pricing.component.html',
  styleUrl: './landing-pricing.component.css',
})
export class LandingPricingComponent {
  /** `false` bills monthly, `true` bills yearly. */
  checked = signal<boolean>(true);

  features: string[] = [
    'Arcu vitae elementum',
    'Dui faucibus in ornare',
    'Morbi tincidunt augue',
    'Duis ultricies lacus sed',
  ];
}
