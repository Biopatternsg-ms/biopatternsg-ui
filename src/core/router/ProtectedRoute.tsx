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
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isProtectedRoute } from "@/routes/protectedRoutes";

/**
 * Route guard component.
 *
 * Wrap any set of routes with `<Route element={<ProtectedRoute />}>` and
  * they will only be reachable when an access token is present. If the user
 * is not authenticated, they are redirected to `/` (Landing page) and the originally
 * requested path is preserved in the `from` location state so the login
 * flow can return the user to where they were heading.
 *
 * The guard is also path-aware: only paths listed in
 * `src/routes/protectedRoutes.ts` (or its `isProtectedRoute` helper) are
 * blocked. Public routes are passed through untouched, which makes the
 * guard safe to use at the layout level for the whole app.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const requiresAuth = isProtectedRoute(location.pathname);

  if (requiresAuth && !isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Outlet />;
}
