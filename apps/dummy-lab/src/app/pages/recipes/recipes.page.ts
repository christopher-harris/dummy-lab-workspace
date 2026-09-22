import {Component, inject} from '@angular/core';
import {RecipesStore} from "@dummy-lab/data-access-recipes";
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'dl-recipes-page',
  imports: [
    JsonPipe
  ],
  templateUrl: './recipes.page.html',
  styleUrl: './recipes.page.css',
})
export class RecipesPage {
  recipesStore = inject(RecipesStore);
}
