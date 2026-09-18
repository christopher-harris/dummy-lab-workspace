import type { User, UsersResponse } from './models';

const DUMMY_JSON_BASE_URL = 'https://dummyjson.com';

export async function fetchUsers(abortSignal?: AbortSignal): Promise<User[]> {
  const response = await fetch(`${DUMMY_JSON_BASE_URL}/users?limit=0`, {
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load users: ${response.status}`);
  }

  const data = (await response.json()) as UsersResponse;
  return data.users;
}
