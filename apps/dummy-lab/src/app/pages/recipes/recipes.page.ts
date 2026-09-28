import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {RecipesStore} from "@dummy-lab/data-access-recipes";
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'dl-recipes-page',
  imports: [
    JsonPipe
  ],
  templateUrl: './recipes.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './recipes.page.css',
})
export class RecipesPage {
  recipesStore = inject(RecipesStore);
}
