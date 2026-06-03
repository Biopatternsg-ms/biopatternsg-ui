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
import { getAccessToken } from "@/services/tokenStorage";
import { logout, refreshAccessToken } from "@/services/authService";

/**
 * HTTP client with automatic Bearer injection and transparent token refresh.
 *
 * Behavior:
 *   1. Attaches `Authorization: Bearer <access_token>` to every outgoing
 *      request when an access token is available.
 *   2. On a 401 response, attempts ONE silent refresh using the stored
 *      refresh_token. If the refresh succeeds, the original request is
 *      retried with the new access_token.
 *   3. Concurrent 401s are coalesced: only one refresh is in-flight at any
 *      time (single-flight). All other callers wait for the same promise.
 *   4. If the refresh itself fails, the session is cleared and a
 *      "session-expired" CustomEvent is dispatched on `window` so the
 *      AuthContext can react (logout + redirect to /login).
 *
 * Usage:
 *   import { authFetch } from "@/services/httpClient";
 *   const res = await authFetch("/config-and-control/users/me");
 */

let refreshInFlight: Promise<string> | null = null;

const SESSION_EXPIRED_EVENT = "biopatternsg:session-expired";

function dispatchSessionExpired(): void {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

/**
 * Returns a promise that resolves to a fresh access_token.
 * If a refresh is already in progress, returns the same promise (single-flight).
 * On failure, clears the session and notifies the app.
 */
function performRefresh(): Promise<string> {
  if (refreshInFlight) {
    return refreshInFlight;
  }
  refreshInFlight = refreshAccessToken()
    .then((pair) => {
      refreshInFlight = null;
      return pair.access_token;
    })
    .catch((err) => {
      refreshInFlight = null;
      logout();
      dispatchSessionExpired();
      throw err;
    });
  return refreshInFlight;
}

/** Adds (or replaces) the Authorization header with the current access token. */
function withAuthHeader(init: RequestInit | undefined): RequestInit {
  const headers = new Headers(init?.headers);
  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return { ...init, headers };
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const firstResponse = await fetch(input, withAuthHeader(init));

  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  // 401 → try to refresh once
  let freshToken: string;
  try {
    freshToken = await performRefresh();
  } catch {
    return firstResponse;
  }

  // Retry the original request with the new token
  const retryHeaders = new Headers(init?.headers);
  retryHeaders.set("Authorization", `Bearer ${freshToken}`);
  return fetch(input, { ...init, headers: retryHeaders });
}

export { SESSION_EXPIRED_EVENT };
