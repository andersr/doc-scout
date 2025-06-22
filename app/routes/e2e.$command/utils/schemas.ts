import { z } from "zod";

export const upsertSourceSchema = z.object({
  sourcePublicId: z.string().min(1),
  username: z.string().min(1),
});
export type UpsertSourceInput = z.infer<typeof upsertSourceSchema>;

export const createChatSchema = z.object({
  sourcePublicId: z.string().min(1),
  username: z.string().min(1),
});
export type CreateChatInput = z.infer<typeof createChatSchema>;
