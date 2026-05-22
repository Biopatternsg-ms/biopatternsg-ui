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
import type { RegisterPayload } from "@/domain/models/User";

/**
 * Raw values captured by the registration form state.
 */
export interface RegisterFormValues {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

/**
 * Adapts internal UI form values into the expected API RegisterPayload structure.
 *
 * Contract translation:
 *   - UI field `email`  →  API field `username`
 *     The form asks the user for an email, but the backend uses that value as
 *     the account's unique username. The mapping is performed here so the UI
 *     stays decoupled from the backend's vocabulary.
 *
 * Normalization:
 *   - email/username: trimmed and lowercased.
 *   - firstName/lastName: trimmed.
 *   - password: passed through unchanged (whitespace may be significant).
 */
export function toRegisterPayload(formValues: RegisterFormValues): RegisterPayload {
  return {
    username: formValues.email.trim().toLowerCase(),
    firstName: formValues.firstName.trim(),
    lastName: formValues.lastName.trim(),
    password: formValues.password,
  };
}
