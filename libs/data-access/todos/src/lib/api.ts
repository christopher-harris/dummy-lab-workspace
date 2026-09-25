import type { Todo, TodosResponse } from './models';

export async function fetchTodos(
  apiBaseUrl: string,
  abortSignal?: AbortSignal,
): Promise<Todo[]> {
  const response = await fetch(`${apiBaseUrl}/todos?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load todos: ${response.status}`);
  }

  const data = (await response.json()) as TodosResponse;
  return data.todos;
}
