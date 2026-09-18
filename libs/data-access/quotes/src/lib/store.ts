import { resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources,
} from '@angular-architects/ngrx-toolkit';
import { signalStore } from '@ngrx/signals';

import { fetchQuotes } from './api';
import type { Quote } from './models';

export const QuotesStore = signalStore(
  { providedIn: 'root' },
  withDevtools('quotes'),
  withCallState({ collection: 'quotesRequest' }),
  withEntityResources(() => ({
    quotes: resource<Quote[], void>({
      loader: ({ abortSignal }) => fetchQuotes(abortSignal),
      defaultValue: [],
    }),
  })),
);
