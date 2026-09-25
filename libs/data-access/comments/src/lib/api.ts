import type { Comment, CommentsResponse } from './models';

export async function fetchComments(
  apiBaseUrl: string,
  abortSignal?: AbortSignal,
): Promise<Comment[]> {
  const response = await fetch(`${apiBaseUrl}/comments?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load comments: ${response.status}`);
  }

  const data = (await response.json()) as CommentsResponse;
  return data.comments;
}
