import { resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources,
} from '@angular-architects/ngrx-toolkit';
import { signalStore } from '@ngrx/signals';

import { fetchTodos } from './api';
import type { Todo } from './models';

export const TodosStore = signalStore(
  { providedIn: 'root' },
  withDevtools('todos'),
  withCallState({ collection: 'todosRequest' }),
  withEntityResources(() => ({
    todos: resource<Todo[], void>({
      loader: ({ abortSignal }) => fetchTodos(abortSignal),
      defaultValue: [],
    }),
  })),
);
