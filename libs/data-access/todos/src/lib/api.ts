import { DUMMY_JSON_BASE_URL } from '@dummy-lab/shared-utils';

import type { Todo, TodosResponse } from './models';

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
