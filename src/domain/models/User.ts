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
 * Domain model: User
 * Interfaces representing user entities and registration payloads.
 */

/**
 * Payload sent to the register endpoint POST /config-and-control/users.
 *
 * NOTE: The backend expects "username" (not "email") as the unique identifier
 * for the account. The UI still asks the user for an email address, and the
 * adapter (userAdapter.ts) maps that email value into this `username` field.
 */
export interface RegisterPayload {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

/** Internal authenticated user representation */
export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}
