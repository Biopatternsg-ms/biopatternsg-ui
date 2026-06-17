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
import { USERS_ENDPOINT } from "@/services/apiConfig";
import type { RegisterPayload } from "@/domain/models/User";
import { baseFetch } from "@/core/http/httpClient";

/**
 * Registers a new user/researcher in the platform.
 * Returns the raw Fetch Response so the calling component can inspect the status code
 * (e.g., 2101, 201, 400, etc.).
 *
 * @param payload The registration payload containing email, firstName, lastName, and password.
 * @throws {Error} If a network-level error occurs.
 */
export async function registerUser(payload: RegisterPayload): Promise<Response> {
  return baseFetch(USERS_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
