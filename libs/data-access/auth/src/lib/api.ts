import type { AuthLoginCredentials, AuthSession } from './models';

const DUMMY_JSON_BASE_URL = 'https://dummyjson.com';

export async function login(
  credentials: AuthLoginCredentials,
  abortSignal?: AbortSignal,
): Promise<AuthSession> {
  const response = await fetch(`${DUMMY_JSON_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to log in: ${response.status}`);
  }

  return (await response.json()) as AuthSession;
}
