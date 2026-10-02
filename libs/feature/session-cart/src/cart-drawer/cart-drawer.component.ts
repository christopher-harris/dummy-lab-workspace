import { Component, inject } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import {
  sessionCartEvents,
  SessionCartStore,
} from '@dummy-lab/data-access-session-cart';
import { injectDispatch } from '@ngrx/signals/events';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'lib-cart-drawer',
  imports: [DrawerModule, ButtonModule, JsonPipe],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.css',
})
export class CartDrawerComponent {
  sessionCartStore = inject(SessionCartStore);
  cartEvents = injectDispatch(sessionCartEvents);
}
