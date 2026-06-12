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
import Landing from "@/modules/public/Landing";
import Register from "@/modules/public/Register";
import RecoveryPassword from "@/modules/public/RecoveryPassword";
import Network from "@/modules/dashboard/networks/Network";
import { ProtectedRoute } from "@/core/router/ProtectedRoute";
import { PublicRoute } from "@/core/router/PublicRoute";

/**
 * App Root Component.
 * Configures the BrowserRouter and defines routes:
 *   - /                  → Public Landing page (blocked if authenticated)
 *   - /register          → Researcher registration portal (blocked if authenticated)
 *   - /recovery-password → Password recovery portal (public, blocked if authenticated)
 *   - /dashboard/network → Network management (protected — requires access_token)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recovery-password" element={<RecoveryPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/network" element={<Network />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
