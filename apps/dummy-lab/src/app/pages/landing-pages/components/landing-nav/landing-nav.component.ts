import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
  selector: 'dl-landing-nav',
  imports: [ButtonModule, StyleClassModule],
  templateUrl: './landing-nav.component.html',
  styleUrl: './landing-nav.component.css',
})
export class LandingNavComponent {}
