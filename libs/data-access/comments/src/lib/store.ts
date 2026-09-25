import { inject, resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources,
} from '@angular-architects/ngrx-toolkit';
import { signalStore, withProps } from '@ngrx/signals';
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';

import { fetchComments } from './api';
import type { Comment } from './models';

export const CommentsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('comments'),
  withCallState({ collection: 'commentsRequest' }),
  withProps(() => ({
    apiBaseUrl: inject(RUNTIME_CONFIG).apiBaseUrl,
  })),
  withEntityResources(({ apiBaseUrl }) => ({
    comments: resource<Comment[], void>({
      loader: ({ abortSignal }) => fetchComments(apiBaseUrl, abortSignal),
      defaultValue: [],
    }),
  })),
);
