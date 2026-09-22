import { DUMMY_JSON_BASE_URL } from '@dummy-lab/shared-utils';

import type { Comment, CommentsResponse } from './models';

export async function fetchComments(
  abortSignal?: AbortSignal,
): Promise<Comment[]> {
  const response = await fetch(`${DUMMY_JSON_BASE_URL}/comments?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load comments: ${response.status}`);
  }

  const data = (await response.json()) as CommentsResponse;
  return data.comments;
}
