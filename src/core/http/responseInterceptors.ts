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
import { logout, refreshAccessToken } from "@/services/authService";

/** Name of the CustomEvent dispatched on `window` when a refresh fails irrecoverably. */
export const SESSION_EXPIRED_EVENT = "biopatternsg:session-expired";

function dispatchSessionExpired(): void {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

let refreshInFlight: Promise<string> | null = null;

/**
 * Returns a promise that resolves to a fresh access_token.
 * If a refresh is already in progress, returns the same promise (single-flight).
 * On failure, clears the session and notifies the app.
 */
export function performRefresh(): Promise<string> {
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
