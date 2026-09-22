import { resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources, withResource,
} from '@angular-architects/ngrx-toolkit';
import { signalStore } from '@ngrx/signals';

import { fetchRecipes } from './api';
import type {Recipe, RecipesResponse} from './models';
import {httpResource} from "@angular/common/http";
import {DUMMY_JSON_BASE_URL} from "@dummy-lab/shared-utils";

export const RecipesStore = signalStore(
  { providedIn: 'root' },
  withDevtools('recipes'),
  withCallState({ collection: 'recipesRequest' }),
  withResource(() => ({
    allRecipes: httpResource<RecipesResponse>(() => `${DUMMY_JSON_BASE_URL}/recipes`)
  })),
  withEntityResources(() => ({
    recipes: resource<Recipe[], void>({
      loader: ({ abortSignal }) => fetchRecipes(abortSignal),
      defaultValue: [],
    }),
  })),
);
