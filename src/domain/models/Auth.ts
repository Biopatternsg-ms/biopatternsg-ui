export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginErrorResponse {
  message: string;
}

export interface AuthSession {
  [key: string]: unknown;
}
