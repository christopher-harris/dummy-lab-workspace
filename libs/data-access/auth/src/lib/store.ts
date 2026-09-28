import { computed, inject } from '@angular/core';
import {
  httpMutation,
  withDevtools,
  withMutations,
  withStorageSync,
} from '@ngrx-toolkit/core';
import {
  patchState,
  signalStore,
  withComputed,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  Events,
  injectDispatch,
  withEventHandlers,
} from '@ngrx/signals/events';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

import { authEvents } from './actions';
import type { AuthLoginCredentials, AuthSession } from './models';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';

interface AuthState {
  credentials: AuthSession | undefined;
}

const initialState: AuthState = {
  credentials: undefined,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withDevtools('auth'),
  withState(initialState),
  withProps(() => ({
    authEvents: injectDispatch(authEvents),
    router: inject(Router),
    events: inject(Events),
    apiBaseUrl: inject(RUNTIME_CONFIG).apiBaseUrl,
  })),
  // NOTE: this persists `accessToken`/`refreshToken` to localStorage and reads
  // them back with no schema check and no version key. See ARCHITECTURE-COMPARISON.md
  // §3.4 — this needs a validated, versioned read path before it goes anywhere real.
  withStorageSync('dummy-lab-auth'),
  withComputed(({ credentials }) => ({
    isLoggedIn: computed(() => !!credentials()),
  })),
  withMutations(({ apiBaseUrl, authEvents, ...store }) => ({
    loginUser: httpMutation({
      request: (credentials: AuthLoginCredentials) => ({
        url: `${apiBaseUrl}/auth/login`,
        method: 'POST',
        body: credentials,
      }),
      parse: (response) => response as AuthSession,
      onSuccess: (session) => {
        patchState(store, { credentials: session });
        authEvents.loginSucceeded(session);
      },
      onError: () =>
        authEvents.loginFailed(
          'Login failed. Check your username and password.',
        ),
    }),
  })),
  withEventHandlers(({ events, router, ...store }) => ({
    loginRequested$: events
      .on(authEvents.loginSubmitted)
      .pipe(tap((event) => store.loginUser(event.payload))),
    loginSucceeded$: events
      .on(authEvents.loginSucceeded)
      .pipe(tap(() => void router.navigate(['/dashboard']))),
    logoutRequested$: events.on(authEvents.logoutRequested).pipe(
      tap(() => {
        patchState(store, { credentials: undefined });
        void router.navigate(['/auth/login']);
      }),
    ),
  })),
);
