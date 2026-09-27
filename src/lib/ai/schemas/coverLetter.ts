import { z } from "zod";

export const coverLetterDraftSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(20),
  sourceFactIds: z.array(z.string()).default([]),
});

export type CoverLetterDraft = z.infer<typeof coverLetterDraftSchema>;
