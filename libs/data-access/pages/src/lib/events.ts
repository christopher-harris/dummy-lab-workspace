import { eventGroup } from '@ngrx/signals/events';
import { type } from '@ngrx/signals';

/**
 * Components dispatch these; they never call store methods (ADR-0004).
 *
 * `pageRequested` carries the full URL path rather than a route param because
 * a `Page` is addressed by its whole path — `/about/careers` is one row, not a
 * parent and a child. Whatever resolves the active URL (a resolver, a
 * catch-all route component, or the server during SSR) is what dispatches it.
 */
export const pagesEvents = eventGroup({
  source: 'Pages',
  events: {
    pageRequested: type<string>(),
    pageCleared: type<void>(),
  },
});
