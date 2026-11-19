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

export const generalConfigSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Experiment name is required.")
    .max(120, "Name must not exceed 120 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(500, "Description must not exceed 500 characters."),
});

export type GeneralConfigFormValues = z.infer<typeof generalConfigSchema>;

export const modelParametersSchema = z
  .object({
    sourceSelection: z.enum(["JASPAR", "TFBIND", "BOTH"]).default("JASPAR"),
    genome: z.string().trim().default(""),
    track: z.string().trim().default(""),
    identity: z.string().trim().default(""),
    chromosome: z.string().trim().default(""),
    strand: z.string().trim().default(""),
    start: z.string().trim().default(""),
    end: z.string().trim().default(""),
    reliability: z.string().trim().default(""),
    promoterRegion: z.string().trim().default(""),
  })
  .superRefine((data, ctx) => {
    const needsJaspar =
      data.sourceSelection === "JASPAR" || data.sourceSelection === "BOTH";
    const needsTfbind =
      data.sourceSelection === "TFBIND" || data.sourceSelection === "BOTH";

    if (needsJaspar) {
      if (!data.genome) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Genome is required.",
          path: ["genome"],
        });
      }
      if (!data.track) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Track is required.",
          path: ["track"],
        });
      }
      if (!data.identity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Identity is required.",
          path: ["identity"],
        });
      } else {
        const num = Number(data.identity);
        if (isNaN(num) || num < 0 || num > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Identity must be a number between 0 and 100.",
            path: ["identity"],
          });
        }
      }
      if (!data.chromosome) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Chromosome is required.",
          path: ["chromosome"],
        });
      }
      if (!data.strand) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Strand is required.",
          path: ["strand"],
        });
      }
      if (!data.start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start position is required.",
          path: ["start"],
        });
      } else if (isNaN(Number(data.start))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start position must be a number.",
          path: ["start"],
        });
      }
      if (!data.end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End position is required.",
          path: ["end"],
        });
      } else if (isNaN(Number(data.end))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End position must be a number.",
          path: ["end"],
        });
      } else if (
        data.start &&
        !isNaN(Number(data.start)) &&
        Number(data.end) < Number(data.start)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End position must be greater than or equal to start.",
          path: ["end"],
        });
      }
    }

    if (needsTfbind) {
      if (!data.reliability) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reliability is required.",
          path: ["reliability"],
        });
      } else {
        const num = Number(data.reliability);
        if (isNaN(num) || num < 0 || num > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Reliability must be between 0 and 100.",
            path: ["reliability"],
          });
        }
      }
    }
  });

export type ModelParametersFormValues = z.infer<typeof modelParametersSchema>;

export const expertObjectsSchema = z.object({
  expertObjectsFile: z.custom<File | null>().optional().nullable(),
  expertObjectsList: z.array(z.any()).default([]),
});

export type ExpertObjectsFormValues = z.infer<typeof expertObjectsSchema>;

export const searchConfigSchema = z.object({
  searchLevel: z.string().trim().min(1, "Search level is required."),
  retMax: z
    .string()
    .trim()
    .min(1, "Max results is required.")
    .refine(
      (val) =>
        !isNaN(Number(val)) &&
        Number.isInteger(Number(val)) &&
        Number(val) >= 1 &&
        Number(val) <= 10000,
      "Max results must be an integer between 1 and 10,000."
    ),
  maxComplexes: z
    .string()
    .trim()
    .min(1, "Max complexes is required.")
    .refine(
      (val) =>
        !isNaN(Number(val)) &&
        Number.isInteger(Number(val)) &&
        Number(val) >= 1 &&
        Number(val) <= 1000,
      "Max complexes must be an integer between 1 and 1,000."
    ),
  useOnlyPrincipalName: z.boolean().default(true),
});

export type SearchConfigFormValues = z.infer<typeof searchConfigSchema>;

export const createExperimentSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Experiment name is required.")
      .max(120, "Name must not exceed 120 characters."),
    description: z
      .string()
      .trim()
      .min(1, "Description is required.")
      .max(500, "Description must not exceed 500 characters."),
    sourceSelection: z.enum(["JASPAR", "TFBIND", "BOTH"]).default("JASPAR"),
    genome: z.string().trim().default(""),
    track: z.string().trim().default(""),
    identity: z.string().trim().default(""),
    chromosome: z.string().trim().default(""),
    strand: z.string().trim().default(""),
    start: z.string().trim().default(""),
    end: z.string().trim().default(""),
    reliability: z.string().trim().default(""),
    promoterRegion: z.string().trim().default(""),
    expertObjectsFile: z.custom<File | null>().optional().nullable(),
    expertObjectsList: z.array(z.any()).default([]),
    searchLevel: z.string().trim().min(1, "Search level is required."),
    retMax: z
      .string()
      .trim()
      .min(1, "Max results is required.")
      .refine(
        (val) =>
          !isNaN(Number(val)) &&
          Number.isInteger(Number(val)) &&
          Number(val) >= 1 &&
          Number(val) <= 10000,
        "Max results must be an integer between 1 and 10,000."
      ),
    maxComplexes: z
      .string()
      .trim()
      .min(1, "Max complexes is required.")
      .refine(
        (val) =>
          !isNaN(Number(val)) &&
          Number.isInteger(Number(val)) &&
          Number(val) >= 1 &&
          Number(val) <= 1000,
        "Max complexes must be an integer between 1 and 1,000."
      ),
    useOnlyPrincipalName: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    const needsJaspar =
      data.sourceSelection === "JASPAR" || data.sourceSelection === "BOTH";
    const needsTfbind =
      data.sourceSelection === "TFBIND" || data.sourceSelection === "BOTH";

    if (needsJaspar) {
      if (!data.genome) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Genome is required.",
          path: ["genome"],
        });
      }
      if (!data.track) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Track is required.",
          path: ["track"],
        });
      }
      if (!data.identity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Identity is required.",
          path: ["identity"],
        });
      } else {
        const num = Number(data.identity);
        if (isNaN(num) || num < 0 || num > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Identity must be a number between 0 and 100.",
            path: ["identity"],
          });
        }
      }
      if (!data.chromosome) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Chromosome is required.",
          path: ["chromosome"],
        });
      }
      if (!data.strand) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Strand is required.",
          path: ["strand"],
        });
      }
      if (!data.start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start position is required.",
          path: ["start"],
        });
      } else if (isNaN(Number(data.start))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start position must be a number.",
          path: ["start"],
        });
      }
      if (!data.end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End position is required.",
          path: ["end"],
        });
      } else if (isNaN(Number(data.end))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End position must be a number.",
          path: ["end"],
        });
      } else if (
        data.start &&
        !isNaN(Number(data.start)) &&
        Number(data.end) < Number(data.start)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End position must be greater than or equal to start.",
          path: ["end"],
        });
      }
    }

    if (needsTfbind) {
      if (!data.reliability) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reliability is required.",
          path: ["reliability"],
        });
      } else {
        const num = Number(data.reliability);
        if (isNaN(num) || num < 0 || num > 100) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Reliability must be between 0 and 100.",
            path: ["reliability"],
          });
        }
      }
    }
  });

export type CreateExperimentFormValues = z.infer<typeof createExperimentSchema>;
