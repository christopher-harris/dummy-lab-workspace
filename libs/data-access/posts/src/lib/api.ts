import type { Post, PostsResponse } from './models';

const DUMMY_JSON_BASE_URL = 'https://dummyjson.com';

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
