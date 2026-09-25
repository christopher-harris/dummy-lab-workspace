import { inject, resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources, withResource,
} from '@angular-architects/ngrx-toolkit';
import { signalStore, withProps } from '@ngrx/signals';

import { fetchPosts } from './api';
import {Post, PostsResponse} from './models';
import {httpResource} from "@angular/common/http";
import { RUNTIME_CONFIG } from '@dummy-lab/shared-runtime-config';

export const PostsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('posts'),
  withCallState({ collection: 'postsRequest' }),
  withProps(() => ({
    apiBaseUrl: inject(RUNTIME_CONFIG).apiBaseUrl,
  })),
  withResource(({ apiBaseUrl }) => ({
    allPosts: httpResource<PostsResponse>(() => `${apiBaseUrl}/posts`),
    topPosts: httpResource<PostsResponse>(() => `${apiBaseUrl}/posts?sortBy=views&order=desc&limit=5`),
  })),
  withEntityResources(({ apiBaseUrl }) => ({
    posts: resource<Post[], void>({
      loader: ({ abortSignal }) => fetchPosts(apiBaseUrl, abortSignal),
      defaultValue: [],
    }),
  })),
);
