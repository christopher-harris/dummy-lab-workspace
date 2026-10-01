import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import { LocationStore } from '@dummy-lab/data-access-location';

@Component({
  imports: [RouterOutlet],
  selector: 'dl-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly runtimeConfig = inject(RUNTIME_CONFIG);
  locationStore = inject(LocationStore);

  constructor() {
    effect(() => {
      // console.log(this.locationStore.supported());
    });
  }
}
