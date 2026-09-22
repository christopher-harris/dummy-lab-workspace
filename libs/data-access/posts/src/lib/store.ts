import { resource } from '@angular/core';
import {
  withCallState,
  withDevtools,
  withEntityResources, withResource,
} from '@angular-architects/ngrx-toolkit';
import { signalStore } from '@ngrx/signals';

import { fetchPosts } from './api';
import {Post, PostsResponse} from './models';
import {httpResource} from "@angular/common/http";
import {DUMMY_JSON_BASE_URL} from "@dummy-lab/shared-utils";

export const PostsStore = signalStore(
  { providedIn: 'root' },
  withDevtools('posts'),
  withCallState({ collection: 'postsRequest' }),
  withResource(() => ({
    allPosts: httpResource<PostsResponse>(() => `${DUMMY_JSON_BASE_URL}/posts`),
    topPosts: httpResource<PostsResponse>(() => `${DUMMY_JSON_BASE_URL}/posts?sortBy=views&order=desc&limit=5`),
  })),
  withEntityResources(() => ({
    posts: resource<Post[], void>({
      loader: ({ abortSignal }) => fetchPosts(abortSignal),
      defaultValue: [],
    }),
  })),
);
