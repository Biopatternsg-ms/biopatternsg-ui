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
 * API Configuration.
 *
 * URL strategy:
 *   - In DEV  → CONFIG_AND_CONTROL is "" (empty string).
 *     The browser issues requests to the SAME origin (e.g. http://localhost:5173).
 *     Vite's dev proxy (see `vite.config.ts → server.proxy`) forwards them
 *     transparently to the backend at http://localhost:8081.
 *     This avoids CORS preflight entirely during development.
 *
 *   - In PROD → reads VITE_API_URL from the environment (e.g. https://api.biopatternsg.com).
 */

export const CONFIG_AND_CONTROL: string = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_API_URL ?? "http://localhost:8081");

/** Endpoint path for users (do NOT include a leading slash — it's added below). */
export const REGISTER_PATH = "config-and-control/users";

/**
 * Final endpoint:
 *   - DEV:  "/config-and-control/users"               (relative → proxied by Vite)
 *   - PROD: "https://<host>/config-and-control/users" (absolute)
 */
export const USERS_ENDPOINT = `${CONFIG_AND_CONTROL}/${REGISTER_PATH}`;

export const LOGIN_PATH = "config-and-control/users/login";
export const LOGIN_ENDPOINT = `${CONFIG_AND_CONTROL}/${LOGIN_PATH}`;

/** Endpoint path for refreshing the access token. */
export const REFRESH_PATH = "config-and-control/users/refresh-token";
export const REFRESH_ENDPOINT = `${CONFIG_AND_CONTROL}/${REFRESH_PATH}`;

/** Endpoint path for requesting a password recovery email. */
export const RECOVERY_PASSWORD_PATH = "config-and-control/users/recovery-password";
export const RECOVERY_PASSWORD_ENDPOINT = `${CONFIG_AND_CONTROL}/${RECOVERY_PASSWORD_PATH}`;
