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
import { useNavigate } from "react-router-dom";
import { PublicHeader } from "@/components/organisms/PublicHeader";
import { Button } from "@/components/atoms/Button";

/**
 * View-specific Header for /register.
 * Thin wrapper around PublicHeader that injects the action buttons for this
 * route. "Register" is hidden because the user is already on /register.
 */
const Header = () => {
  const navigate = useNavigate();

  return (
    <PublicHeader
      actions={
        <>
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>
          <div aria-hidden="true" className="invisible">
            <Button variant="primary" size="md">
              Register
            </Button>
          </div>
        </>
      }
    />
  );
};

export { Header };
