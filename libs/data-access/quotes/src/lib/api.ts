import type { Quote, QuotesResponse } from './models';

export async function fetchQuotes(
  apiBaseUrl: string,
  abortSignal?: AbortSignal,
): Promise<Quote[]> {
  const response = await fetch(`${apiBaseUrl}/quotes?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load quotes: ${response.status}`);
  }

  const data = (await response.json()) as QuotesResponse;
  return data.quotes;
}
