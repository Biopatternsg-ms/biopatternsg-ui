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
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  /**
   * Dev server proxy — resolves CORS in development.
   *
   * Why: The browser blocks cross-origin requests from http://localhost:5173
   * (Vite dev server) to http://localhost:8081 (Spring Boot backend) because
   * the ports differ. By proxying through Vite, the browser sees same-origin
   * requests and never triggers a CORS preflight.
   *
   * Flow:
   *   Browser → http://localhost:5173/config-and-control/users
   *                ↓ (Vite proxies transparently)
   *             http://localhost:8081/config-and-control/users
   */
  server: {
    proxy: {
      "/config-and-control": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
