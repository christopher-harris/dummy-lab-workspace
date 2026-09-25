import type { User, UsersResponse } from './models';

export async function fetchUsers(
  apiBaseUrl: string,
  abortSignal?: AbortSignal,
): Promise<User[]> {
  const response = await fetch(`${apiBaseUrl}/users?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load users: ${response.status}`);
  }

  const data = (await response.json()) as UsersResponse;
  return data.users;
}
