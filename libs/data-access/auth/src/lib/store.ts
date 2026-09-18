import { resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withResource,
} from '@angular-architects/ngrx-toolkit';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { login } from './api';
import type { AuthLoginCredentials, AuthSession } from './models';

interface AuthState {
  credentials: AuthLoginCredentials | undefined;
}

const initialState: AuthState = {
  credentials: undefined,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withDevtools('auth'),
  withCallState({ collection: 'auth' }),
  withState(initialState),
  withResource(
    ({ credentials }) =>
      resource<AuthSession | undefined, AuthLoginCredentials | undefined>({
        params: credentials,
        loader: ({ params, abortSignal }) => login(params, abortSignal),
        defaultValue: undefined,
      }),
    { errorHandling: 'undefined value' },
  ),
  withMethods((store) => ({
    login(credentials: AuthLoginCredentials): void {
      patchState(store, { credentials });
    },
    logout(): void {
      patchState(store, { credentials: undefined, value: undefined });
    },
  })),
);
