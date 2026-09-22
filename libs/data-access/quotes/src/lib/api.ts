import { DUMMY_JSON_BASE_URL } from '@dummy-lab/shared-utils';

import type { Quote, QuotesResponse } from './models';

export async function fetchQuotes(abortSignal?: AbortSignal): Promise<Quote[]> {
  const response = await fetch(`${DUMMY_JSON_BASE_URL}/quotes?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load quotes: ${response.status}`);
  }

  const data = (await response.json()) as QuotesResponse;
  return data.quotes;
}
