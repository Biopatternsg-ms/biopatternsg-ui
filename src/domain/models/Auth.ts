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

/**
 * Domain model: Auth
 * Interfaces representing authentication payloads, tokens and session data.
 */

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginErrorResponse {
  message: string;
}

/**
 * Pair of tokens returned by the backend on successful authentication.
 *   - access_token  : short-lived JWT used to authorize API calls (Bearer).
 *   - refresh_token : long-lived credential used to obtain a new access_token
 *                     without forcing the user to log in again.
 */
export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

/** Payload sent to the refresh endpoint to obtain a new access_token. */
export interface RefreshPayload {
  refresh_token: string;
}

/** Payload sent to the password recovery endpoint. */
export interface RecoveryPasswordPayload {
  username: string;
}
