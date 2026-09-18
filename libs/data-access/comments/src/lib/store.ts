import { resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources,
} from '@angular-architects/ngrx-toolkit';
import { signalStore } from '@ngrx/signals';

import { fetchComments } from './api';
import type { Comment } from './models';

export const CommentsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('comments'),
  withCallState({ collection: 'commentsRequest' }),
  withEntityResources(() => ({
    comments: resource<Comment[], void>({
      loader: ({ abortSignal }) => fetchComments(abortSignal),
      defaultValue: [],
    }),
  })),
);
