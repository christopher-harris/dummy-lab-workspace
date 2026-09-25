import { inject, resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources, withResource,
} from '@angular-architects/ngrx-toolkit';
import { signalStore, withProps } from '@ngrx/signals';

import { fetchTodos } from './api';
import type {Todo, TodosResponse} from './models';
import {httpResource} from "@angular/common/http";
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';

export const TodosStore = signalStore(
  { providedIn: 'root' },
  withDevtools('todos'),
  withCallState({ collection: 'todosRequest' }),
  withProps(() => ({
    apiBaseUrl: inject(RUNTIME_CONFIG).apiBaseUrl,
  })),
  withResource(({ apiBaseUrl }) => ({
    allTodos: httpResource<TodosResponse>(() => `${apiBaseUrl}/todos`)
  })),
  withEntityResources(({ apiBaseUrl }) => ({
    todos: resource<Todo[], void>({
      loader: ({ abortSignal }) => fetchTodos(apiBaseUrl, abortSignal),
      defaultValue: [],
    }),
  })),
);
