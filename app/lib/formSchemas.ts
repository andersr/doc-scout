import { z } from "zod";

export const newProjectSchema = z.object({
  name: z.string().min(1),
});

export const playgroundSchema = z.object({
  question: z.string(),
  sources: z.union([z.string(), z.string().array()]),
});
