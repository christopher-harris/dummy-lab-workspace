import type { AuthLoginCredentials, AuthSession } from './models';

export async function login(
  apiBaseUrl: string,
  credentials: AuthLoginCredentials,
  abortSignal?: AbortSignal,
): Promise<AuthSession> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
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
