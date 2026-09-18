import { resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources,
} from '@angular-architects/ngrx-toolkit';
import { signalStore } from '@ngrx/signals';

import { fetchPosts } from './api';
import type { Post } from './models';

export const PostsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('posts'),
  withCallState({ collection: 'postsRequest' }),
  withEntityResources(() => ({
    posts: resource<Post[], void>({
      loader: ({ abortSignal }) => fetchPosts(abortSignal),
      defaultValue: [],
    }),
  })),
);
