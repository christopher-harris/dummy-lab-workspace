export interface AuthLoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface AuthSession {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
  [key: string]: unknown;
}
