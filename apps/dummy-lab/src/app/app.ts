import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';

@Component({
  imports: [RouterOutlet],
  selector: 'dl-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly runtimeConfig = inject(RUNTIME_CONFIG);
}
