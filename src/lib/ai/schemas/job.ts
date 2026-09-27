import { z } from "zod";

export const jobSalarySchema = z.object({
  min: z.number().nullable().optional(),
  max: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  period: z.enum(["annual", "hourly", "monthly", "unknown"]).nullable().optional(),
});

export const jobAnalysisSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  source: z.string().default("unknown"),
  sourceJobId: z.string().nullable().optional(),
  url: z.string().url().nullable().optional(),
  company: z.string().default("Unknown Company"),
  title: z.string().default("Untitled Role"),
  description: z.string().default(""),
  location: z.array(z.string()).default([]),
  remotePolicy: z.enum(["remote", "hybrid", "onsite", "unknown"]).default("unknown"),
  employmentType: z
    .enum(["full_time", "part_time", "contract", "internship", "temporary", "unknown"])
    .nullable()
    .optional(),
  seniority: z
    .enum(["intern", "entry", "mid", "senior", "lead", "principal", "unknown"])
    .nullable()
    .optional(),
  salary: jobSalarySchema.nullable().optional(),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  publishedAt: z.string().nullable().optional(),
  importantQualifications: z.array(z.string()).default([]),
});

export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;
