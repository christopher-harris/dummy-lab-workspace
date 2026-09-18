import type { Recipe, RecipesResponse } from './models';

const DUMMY_JSON_BASE_URL = 'https://dummyjson.com';

export async function fetchRecipes(
  abortSignal?: AbortSignal,
): Promise<Recipe[]> {
  const response = await fetch(`${DUMMY_JSON_BASE_URL}/recipes?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load recipes: ${response.status}`);
  }

  const data = (await response.json()) as RecipesResponse;
  return data.recipes;
}
