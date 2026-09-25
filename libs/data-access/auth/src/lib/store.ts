import {computed, inject} from '@angular/core';
import {
  httpMutation,
  withDevtools, withMutations,
  withStorageSync,
} from '@angular-architects/ngrx-toolkit';
import {patchState, signalStore, withComputed, withProps, withState} from '@ngrx/signals';
import type { AuthLoginCredentials, AuthSession } from './models';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';
import {Events, injectDispatch, withEventHandlers, withReducer, on} from "@ngrx/signals/events";
import {authEvents} from "./actions";
import {tap} from "rxjs";
import {Router} from "@angular/router";

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
  withStorageSync('dummy-lab-auth'),
  withComputed(({credentials}) => ({
    isLoggedIn: computed(() => !!credentials()),
  })),
  // withResource(
  //   ({ credentials }) =>
  //     resource<AuthSession | undefined, AuthLoginCredentials | undefined>({
  //       params: credentials,
  //       loader: ({ params, abortSignal }) => login(params, abortSignal),
  //       defaultValue: undefined,
  //     }),
  //   { errorHandling: 'undefined value' },
  // ),
  // withMethods((store) => ({
  //   login(credentials: AuthLoginCredentials): void {
  //     patchState(store, { credentials });
  //   },
  //   logout(): void {
  //     patchState(store, { credentials: undefined, value: undefined });
  //   },
  // })),
  withMutations(({apiBaseUrl, authEvents, ...store}) => ({
    loginUser: httpMutation({
      request: (credentials: AuthLoginCredentials) => ({
        url: `${apiBaseUrl}/user/login`,
        method: 'POST',
        body: credentials,
        reportProgress: true,
      }),
      parse: (res) => res as AuthSession,
      onSuccess: (response) => {
        // console.log('loginUser onSuccess', response);
        patchState(store, { credentials: response });
        authEvents.loginSucceeded(response);
      },
      onError: (error) => console.error('loginUser onError', error),
    })
  })),
  // withReducer(
  //   on(authEvents.loginSucceeded, (event) => ({credentials: event.payload})),
  // ),
  withEventHandlers(({events, router, ...store}) => ({
    loginRequested$: events.on(authEvents.loginSubmitted).pipe(
      tap((event: any) => {
        console.log('loginRequested$', event);
        store.loginUser(event.payload);
      })
    ),
    loginSucceeded$: events.on(authEvents.loginSucceeded).pipe(
      tap((event: any) => {
        console.log('loginSucceeded$', event);
        router.navigate(['/dashboard']);
      })
    ),
    logoutRequested$: events.on(authEvents.logoutRequested).pipe(
      tap(() => {
        console.log('logoutRequested$', event);
        patchState(store, { credentials: undefined });
        router.navigate(['/auth/login']);
      })
    ),
  })),
);
