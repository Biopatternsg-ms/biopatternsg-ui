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
import { baseFetch } from "@/core/http/httpClient";

export interface ExampleGraphTemplates {
  nodesTxt: string;
  linksTxt: string;
}

/**
 * Loads default example graph nodes and links templates from public static assets.
 *
 * @throws {Error} If either template file fails to fetch (status not ok).
 * @returns {Promise<ExampleGraphTemplates>} Object containing raw text for nodes and links.
 */
export async function loadExampleGraphTemplates(): Promise<ExampleGraphTemplates> {
  const [nodesRes, linksRes] = await Promise.all([
    baseFetch("/templates/graph-nodes-example.txt", {
      headers: { Accept: "text/plain" },
    }),
    baseFetch("/templates/graph-links-example.txt", {
      headers: { Accept: "text/plain" },
    }),
  ]);

  if (!nodesRes.ok) {
    throw new Error(`Failed to load graph-nodes-example.txt: ${nodesRes.statusText}`);
  }
  if (!linksRes.ok) {
    throw new Error(`Failed to load graph-links-example.txt: ${linksRes.statusText}`);
  }

  const [nodesTxt, linksTxt] = await Promise.all([
    nodesRes.text(),
    linksRes.text(),
  ]);

  return { nodesTxt, linksTxt };
}
