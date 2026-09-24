import { eventGroup } from '@ngrx/signals/events';
import { type } from '@ngrx/signals';
import { AuthLoginCredentials, AuthSession } from './models';

export const authEvents = eventGroup({
  source: 'Auth',
  events: {
    loginSubmitted: type<AuthLoginCredentials>(),
    loginSucceeded: type<AuthSession>(),
    loginFailed: type<string>(),
    logoutRequested: type<void>(),
    sessionRestored: type<AuthSession>(),
    sessionExpired: type<void>(),
  },
});
