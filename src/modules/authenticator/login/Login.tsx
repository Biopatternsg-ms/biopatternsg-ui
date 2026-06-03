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
import { Header } from "./Header";
import { Footer } from "@/components/organisms/Footer";
import { LoginForm } from "@/components/organisms/LoginForm";

const Login = () => {
  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-28">
        <section className="bg-surface-section min-h-[calc(100vh-112px)] flex items-center justify-center px-8 py-16 relative">
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, #0050cb 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 w-full max-w-lg">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label text-[10px] uppercase tracking-widest font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Researcher Access Session
              </span>
            </div>

            <LoginForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
