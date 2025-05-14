import { z } from "zod";

export const newProjectSchema = z.object({
  name: z.string().min(1),
});

export const playgroundSchema = z.object({
  question: z.string().min(1),
  sources: z.string().array().min(1),
});
