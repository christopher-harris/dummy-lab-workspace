import type { Recipe, RecipesResponse } from './models';

export async function fetchRecipes(
  apiBaseUrl: string,
  abortSignal?: AbortSignal,
): Promise<Recipe[]> {
  const response = await fetch(`${apiBaseUrl}/recipes?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load recipes: ${response.status}`);
  }

  const data = (await response.json()) as RecipesResponse;
  return data.recipes;
}
