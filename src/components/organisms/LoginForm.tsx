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
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";

/**
 * LoginForm Organism.
 * Glassmorphism card ("Glass & Gradient" rule).
 * "No-Line" rule: ghost-border at outline-variant/15 opacity.
 */
const LoginForm = () => (
  <div className="glass-panel p-8 rounded-2xl border border-outline-variant/15 shadow-xl relative overflow-hidden">
    {/* Decorative blur orb */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

    <div className="relative z-10">
      <h2 className="text-2xl font-black font-headline tracking-tight text-on-surface mb-2">
        Access Lab Portal
      </h2>
      <p className="text-sm text-on-surface-variant font-label uppercase tracking-wider mb-8">
        Node-04 Secure Entrance
      </p>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <FormField
          label="Researcher Email"
          type="email"
          placeholder="name@institute.edu"
        />

        <FormField
          label="Security Key"
          type="password"
          placeholder="••••••••"
          labelRight={
            <a
              href="#"
              className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline"
            >
              Forgot?
            </a>
          }
        />

        <Button variant="primary" size="lg" className="w-full py-4" type="submit">
          Initialize Session
        </Button>
      </form>

      {/* Footer divider — "No-Line": outline-variant at 10% */}
      <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
        <p className="text-sm text-on-surface-variant">
          New researcher on the team?
        </p>
        <Button variant="link" className="mt-2" type="button">
          Create an institutional account
        </Button>
      </div>
    </div>
  </div>
);

export { LoginForm };
