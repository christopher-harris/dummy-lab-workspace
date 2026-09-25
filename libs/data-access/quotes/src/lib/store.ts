import { inject, resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources,
} from '@angular-architects/ngrx-toolkit';
import { signalStore, withProps } from '@ngrx/signals';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';

import { fetchQuotes } from './api';
import type { Quote } from './models';

export const QuotesStore = signalStore(
  { providedIn: 'root' },
  withDevtools('quotes'),
  withCallState({ collection: 'quotesRequest' }),
  withProps(() => ({
    apiBaseUrl: inject(RUNTIME_CONFIG).apiBaseUrl,
  })),
  withEntityResources(({ apiBaseUrl }) => ({
    quotes: resource<Quote[], void>({
      loader: ({ abortSignal }) => fetchQuotes(apiBaseUrl, abortSignal),
      defaultValue: [],
    }),
  })),
);
