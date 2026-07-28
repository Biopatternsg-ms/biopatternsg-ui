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
import { USERS_ENDPOINT, ADMIN_USERS_ENDPOINT, CREATE_ADMIN_USER_ENDPOINT, adminUserStatusEndpoint } from "@/services/apiConfig";
import type { RegisterPayload, CreateAdminUserPayload } from "@/domain/models/User";
import { baseFetch, authFetch } from "@/core/http/httpClient";

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

export interface UserModel {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  createdTimestamp: number;
}

/**
 * Fetches the paginated list of users for the admin dashboard.
 */
export async function getAdminUsers(page: number = 0, size: number = 10): Promise<UserModel[]> {
  const response = await authFetch(`${ADMIN_USERS_ENDPOINT}?page=${page}&size=${size}`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
}

/**
 * Creates a new user from the admin dashboard.
 */
export async function createAdminUser(payload: CreateAdminUserPayload): Promise<Response> {
  return authFetch(CREATE_ADMIN_USER_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Toggles the enabled status of a user (admin operation).
 * PUT /config-and-control/admin/user/{userId}/status
 * Body: { enabled: boolean } — the new desired state.
 *
 * Returns the raw Fetch Response so the caller can inspect the status code.
 */
export async function setAdminUserStatus(userId: string, enabled: boolean): Promise<Response> {
  return authFetch(adminUserStatusEndpoint(userId), {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  });
}
