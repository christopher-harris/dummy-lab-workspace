import { resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources, withResource,
} from '@angular-architects/ngrx-toolkit';
import { signalStore } from '@ngrx/signals';

import { fetchTodos } from './api';
import type {Todo, TodosResponse} from './models';
import {httpResource} from "@angular/common/http";
import {DUMMY_JSON_BASE_URL} from "@dummy-lab/shared-utils";

export const TodosStore = signalStore(
  { providedIn: 'root' },
  withDevtools('todos'),
  withCallState({ collection: 'todosRequest' }),
  withResource(() => ({
    allTodos: httpResource<TodosResponse>(() => `${DUMMY_JSON_BASE_URL}/todos`)
  })),
  withEntityResources(() => ({
    todos: resource<Todo[], void>({
      loader: ({ abortSignal }) => fetchTodos(abortSignal),
      defaultValue: [],
    }),
  })),
);
