import {inject, resource} from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources, withResource,
} from '@angular-architects/ngrx-toolkit';
import {signalStore, withProps} from '@ngrx/signals';
import { fetchUsers } from './api';
import {User, UsersResponse} from './models';
import {httpResource} from "@angular/common/http";
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import {AuthStore} from "@dummy-lab/data-access-auth";

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withDevtools('users'),
  withCallState({ collection: 'usersRequest' }),
  withProps(() => ({
    authStore: inject(AuthStore),
    apiBaseUrl: inject(RUNTIME_CONFIG).apiBaseUrl,
  })),
  withResource(({apiBaseUrl, authStore}) => ({
    allUsers: httpResource<UsersResponse>(() => `${apiBaseUrl}/users`),
    currentUser: httpResource<User>(() => authStore.credentials() ? `${apiBaseUrl}/auth/me` : undefined),
  })),
  withEntityResources(({ apiBaseUrl }) => ({
    users: resource<User[], void>({
      loader: ({ abortSignal }) => fetchUsers(apiBaseUrl, abortSignal),
      defaultValue: [],
    }),
  })),
);
