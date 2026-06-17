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
import { withAuthHeader } from "./requestInterceptors";
import {
  performRefresh,
  SESSION_EXPIRED_EVENT,
} from "./responseInterceptors";

export { SESSION_EXPIRED_EVENT };

/**
 * Base HTTP client that automatically injects default JSON headers.
 * Use this instead of native `fetch` for unauthenticated endpoints.
 */
export function baseFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  return fetch(input, { ...init, headers });
}

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
 *   import { authFetch } from "@/core/http/httpClient";
 *   const res = await authFetch("/config-and-control/users/me");
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const firstResponse = await baseFetch(input, withAuthHeader(init));

  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  let freshToken: string;
  try {
    freshToken = await performRefresh();
  } catch {
    return firstResponse;
  }

  const retryHeaders = new Headers(init?.headers);
  retryHeaders.set("Authorization", `Bearer ${freshToken}`);
  return baseFetch(input, { ...init, headers: retryHeaders });
}
