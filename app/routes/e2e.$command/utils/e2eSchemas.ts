import { z } from "zod";

export const upsertSourceSchema = z.object({
  email: z.string().email(),
  sourcePublicId: z.string().min(1),
});
export type UpsertSourceInput = z.infer<typeof upsertSourceSchema>;

export const deleteSourceSchema = z.object({
  sourcePublicId: z.string().min(1),
});
export type DeleteSourceInput = z.infer<typeof deleteSourceSchema>;

export const createChatSchema = z.object({
  email: z.string().email(),
  sourcePublicId: z.string().min(1),
});
export type CreateChatInput = z.infer<typeof createChatSchema>;
