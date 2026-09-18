import type { Quote, QuotesResponse } from './models';

const DUMMY_JSON_BASE_URL = 'https://dummyjson.com';

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
