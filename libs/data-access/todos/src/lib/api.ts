import type { Todo, TodosResponse } from './models';

const DUMMY_JSON_BASE_URL = 'https://dummyjson.com';

export async function fetchTodos(abortSignal?: AbortSignal): Promise<Todo[]> {
  const response = await fetch(`${DUMMY_JSON_BASE_URL}/todos?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load todos: ${response.status}`);
  }

  const data = (await response.json()) as TodosResponse;
  return data.todos;
}
