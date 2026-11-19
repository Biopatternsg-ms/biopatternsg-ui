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

export const biologicalRoleItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required."),
  roles: z.array(z.string()).default([]),
});

export const updateBiologicalObjectsSchema = z.object({
  objects: z
    .array(biologicalRoleItemSchema)
    .min(1, "At least one biological object is required."),
});

export type UpdateBiologicalObjectsFormValues = z.infer<
  typeof updateBiologicalObjectsSchema
>;

export const synonymInputSchema = z
  .string()
  .trim()
  .min(1, "Synonym cannot be empty.")
  .max(120, "Synonym must not exceed 120 characters.");

export const alignedObjectItemSchema = z.object({
  id: z.string().optional(),
  symbol: z.string().trim().min(1, "Symbol is required."),
  synonyms: z.array(z.string()).default([]),
});

export const updateAlignedObjectsSchema = z.object({
  alignedObjects: z
    .array(alignedObjectItemSchema)
    .min(1, "At least one aligned object is required."),
});

export type UpdateAlignedObjectsFormValues = z.infer<
  typeof updateAlignedObjectsSchema
>;

export const selectClosingObjectsSchema = z.object({
  selectedClosingObjectIds: z
    .array(z.string())
    .min(1, "Select at least one closing object."),
});

export type SelectClosingObjectsFormValues = z.infer<
  typeof selectClosingObjectsSchema
>;
