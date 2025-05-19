import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const newProjectSchema = z.object({
  name: z.string().min(1),
});

export const newCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
});

export const newQuerySchema = z.object({
  collectionId: z.string().min(1),
});

const answerSchema = z.object({
  query: z.string().min(1),
  namespace: z.string().min(1),
  chatPublicId: z.string().min(1),
});
export const answerSchemaResolver = zodResolver(answerSchema);
export type AnswerFormTypes = z.infer<typeof answerSchema>;

export const playgroundSchema = z.object({
  question: z.string(),
  sources: z.union([z.string(), z.string().array()]),
});

export const collectionChatSchema = z.object({
  message: z.string().min(1),
});
