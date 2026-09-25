import type { Post, PostsResponse } from './models';

export async function fetchPosts(
  apiBaseUrl: string,
  abortSignal?: AbortSignal,
): Promise<Post[]> {
  const response = await fetch(`${apiBaseUrl}/posts?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load posts: ${response.status}`);
  }

  const data = (await response.json()) as PostsResponse;
  return data.posts;
}
