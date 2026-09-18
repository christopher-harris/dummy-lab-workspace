import { resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources,
} from '@angular-architects/ngrx-toolkit';
import { signalStore } from '@ngrx/signals';

import { fetchUsers } from './api';
import type { User } from './models';

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withDevtools('users'),
  withCallState({ collection: 'usersRequest' }),
  withEntityResources(() => ({
    users: resource<User[], void>({
      loader: ({ abortSignal }) => fetchUsers(abortSignal),
      defaultValue: [],
    }),
  })),
);
