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
import * as React from "react";
import {
  hasAccessToken,
  clearTokens,
  setTokens,
} from "@/core/http/tokenStorage";
import { SESSION_EXPIRED_EVENT } from "@/core/http/httpClient";
import type { TokenPair } from "@/domain/models/Auth";

/**
 * AuthContext
 *
 * Holds the authentication state for the React tree and exposes
 * login / logout actions to consumers via the `useAuth` hook.
 *
 *   - isAuthenticated  : true when an access token is present in storage.
 *   - login(tokens)    : persists the tokens and flips the flag to true.
 *   - logout()         : clears the tokens and flips the flag to false.
 *
 * On mount the provider rehydrates the flag from localStorage, so a page
 * reload does not log the user out. It also subscribes to the
 * "session-expired" event fired by the httpClient when a refresh fails, so
 * the app reacts globally without each component having to listen.
 */

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (tokens: TokenPair) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

  React.useEffect(() => {
    setIsAuthenticated(hasAccessToken());
  }, []);

  React.useEffect(() => {
    const handler = () => {
      clearTokens();
      setIsAuthenticated(false);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handler);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
    };
  }, []);

  const login = React.useCallback((tokens: TokenPair) => {
    setTokens(tokens);
    setIsAuthenticated(true);
  }, []);

  const logout = React.useCallback(() => {
    clearTokens();
    setIsAuthenticated(false);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
