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
 * Protected routes registry.
 *
 * Single source of truth that lists every URL prefix which requires an
 * authenticated session. The route guard (`ProtectedRoute`) consults this
 * module to decide whether the current path is protected.
 *
 * Convention: anything under `/dashboard` is protected.
 */

export const PROTECTED_ROUTES: readonly string[] = [
  "/dashboard",
] as const;

export function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
}
