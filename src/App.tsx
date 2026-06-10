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
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/modules/public/landing/Landing";
import Register from "@/modules/authenticator/register/Register";
import Login from "@/modules/authenticator/login/Login";
import RecoveryPassword from "@/modules/authenticator/recovery/RecoveryPassword";
import Dashboard from "@/modules/session/dashboard/Dashboard";
import Network from "@/modules/session/network/Dashboard";
import { ProtectedRoute } from "@/core/router/ProtectedRoute";

/**
 * App Root Component.
 * Configures the BrowserRouter and defines key public and authenticator routes:
 *   - /                  → Public Landing page
 *   - /register          → Researcher registration portal
 *   - /login             → Researcher login portal
 *   - /recovery-password → Password recovery portal (public)
 *   - /dashboard         → Post-login dashboard (protected — requires access_token)
 *
 * The dashboard route is nested under <ProtectedRoute />, which consults
 * `src/routes/protectedRoutes.ts` to decide whether the current path needs
 * an authenticated session. Unauthenticated users are redirected to /login.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recovery-password" element={<RecoveryPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/network" element={<Network />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
