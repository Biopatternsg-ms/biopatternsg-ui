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
import * as z from "zod";

export const inferenceConfigSchema = z.object({
  restrictionLevel: z
    .enum(["RESTRICTED", "VERY_RESTRICTED"])
    .default("RESTRICTED"),
  summarizeKb: z.boolean().default(true),
  maxDepth: z.coerce
    .number()
    .int()
    .min(1, "Max depth must be at least 1.")
    .max(20, "Max depth cannot exceed 20.")
    .default(10),
  startFirstRoles: z
    .array(z.string())
    .min(1, "Select at least one role for Start (first)."),
  startSecondRoles: z
    .array(z.string())
    .min(1, "Select at least one role for Start (second)."),
  intermediateFirstRoles: z
    .array(z.string())
    .min(1, "Select at least one role for Intermediate (first)."),
  intermediateSecondRoles: z
    .array(z.string())
    .min(1, "Select at least one role for Intermediate (second)."),
  endFirstRoles: z
    .array(z.string())
    .min(1, "Select at least one role for End (first)."),
  endSecondRoles: z
    .array(z.string())
    .min(1, "Select at least one role for End (second)."),
});

export type InferenceConfigFormValues = z.infer<typeof inferenceConfigSchema>;
