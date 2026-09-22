import { resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources, withResource,
} from '@angular-architects/ngrx-toolkit';
import { signalStore } from '@ngrx/signals';

import { fetchUsers } from './api';
import {User, UsersResponse} from './models';
import {httpResource} from "@angular/common/http";
import {DUMMY_JSON_BASE_URL} from "@dummy-lab/shared-utils";

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withDevtools('users'),
  withCallState({ collection: 'usersRequest' }),
  withResource(() => ({
    allUsers: httpResource<UsersResponse>(() => `${DUMMY_JSON_BASE_URL}/users`)
  })),
  withEntityResources(() => ({
    users: resource<User[], void>({
      loader: ({ abortSignal }) => fetchUsers(abortSignal),
      defaultValue: [],
    }),
  })),
);
