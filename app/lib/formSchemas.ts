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

export const playgroundSchema = z.object({
  question: z.string(),
  sources: z.union([z.string(), z.string().array()]),
});

export const collectionChatSchema = z.object({
  message: z.string().min(1),
  sourceIds: z.union([z.string(), z.string().array()]),
  collectionId: z.string().min(1),
});
