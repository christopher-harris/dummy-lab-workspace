import { resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources,
} from '@angular-architects/ngrx-toolkit';
import { signalStore } from '@ngrx/signals';

import { fetchRecipes } from './api';
import type { Recipe } from './models';

export const RecipesStore = signalStore(
  { providedIn: 'root' },
  withDevtools('recipes'),
  withCallState({ collection: 'recipesRequest' }),
  withEntityResources(() => ({
    recipes: resource<Recipe[], void>({
      loader: ({ abortSignal }) => fetchRecipes(abortSignal),
      defaultValue: [],
    }),
  })),
);
