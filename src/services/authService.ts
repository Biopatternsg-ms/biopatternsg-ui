/*
 * Copyright © 2026 biopatternsg (biopatternsg@gmail.com)
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  clearTokens,
  getRefreshToken,
  setTokens,
} from "@/core/http/tokenStorage";
import type {
  LoginPayload,
  RecoveryPasswordPayload,
  RefreshPayload,
  TokenPair,
} from "@/domain/models/Auth";
import {
  LOGIN_ENDPOINT,
  RECOVERY_PASSWORD_ENDPOINT,
  REFRESH_ENDPOINT,
} from "@/services/apiConfig";

/**
 * Performs the login request.
 * Returns the raw Fetch Response so the caller can inspect the status code
 * (e.g. 200, 401, 400).
 *
 * @throws {Error} If a network-level error occurs.
 */
export async function loginUser(payload: LoginPayload): Promise<Response> {
  return fetch(LOGIN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Persists the token pair returned by the backend in localStorage.
 * Centralizes storage so the rest of the app never touches localStorage directly.
 */
export function persistSession(tokens: TokenPair): void {
  setTokens(tokens);
}

/**
 * Requests a new access_token using the stored refresh_token.
 * The refresh endpoint is hit with a plain fetch (no Authorization header and
 * no httpClient interceptor) to avoid infinite recursion on 401.
 *
 * @throws {Error} If the refresh request fails (network error or non-2xx).
 */
export async function refreshAccessToken(): Promise<TokenPair> {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error("No refresh token available");
  }
  const body: RefreshPayload = { refresh_token: refresh };
  const response = await fetch(REFRESH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Refresh failed with status ${response.status}`);
  }
  const data = (await response.json()) as TokenPair;
  setTokens(data);
  return data;
}

/**
 * Clears the stored tokens. Used both on explicit logout and on a failed
 * refresh (irrecoverable session).
 */
export function logout(): void {
  clearTokens();
}

/**
 * Requests a password recovery email for the given account.
 * This endpoint is public (does not require an access_token) and is hit with
 * a plain fetch to avoid running through the authFetch interceptor.
 *
 * Returns the raw Fetch Response so the caller can inspect the status code.
 *
 * @throws {Error} If a network-level error occurs.
 */
export async function recoverPassword(
  payload: RecoveryPasswordPayload
): Promise<Response> {
  return fetch(RECOVERY_PASSWORD_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
}
