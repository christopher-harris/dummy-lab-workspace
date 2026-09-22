import { DUMMY_JSON_BASE_URL } from '@dummy-lab/shared-utils';

import type { User, UsersResponse } from './models';

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
