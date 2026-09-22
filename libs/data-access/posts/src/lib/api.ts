import { DUMMY_JSON_BASE_URL } from '@dummy-lab/shared-utils';

import type { Post, PostsResponse } from './models';

export async function fetchPosts(abortSignal?: AbortSignal): Promise<Post[]> {
  const response = await fetch(`${DUMMY_JSON_BASE_URL}/posts?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load posts: ${response.status}`);
  }

  const data = (await response.json()) as PostsResponse;
  return data.posts;
}
