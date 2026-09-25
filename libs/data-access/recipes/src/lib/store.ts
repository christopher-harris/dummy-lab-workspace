import { inject, resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources, withResource,
} from '@angular-architects/ngrx-toolkit';
import { signalStore, withProps } from '@ngrx/signals';

import { fetchRecipes } from './api';
import type {Recipe, RecipesResponse} from './models';
import {httpResource} from "@angular/common/http";
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';

export const RecipesStore = signalStore(
  { providedIn: 'root' },
  withDevtools('recipes'),
  withCallState({ collection: 'recipesRequest' }),
  withProps(() => ({
    apiBaseUrl: inject(RUNTIME_CONFIG).apiBaseUrl,
  })),
  withResource(({ apiBaseUrl }) => ({
    allRecipes: httpResource<RecipesResponse>(() => `${apiBaseUrl}/recipes`)
  })),
  withEntityResources(({ apiBaseUrl }) => ({
    recipes: resource<Recipe[], void>({
      loader: ({ abortSignal }) => fetchRecipes(apiBaseUrl, abortSignal),
      defaultValue: [],
    }),
  })),
);
