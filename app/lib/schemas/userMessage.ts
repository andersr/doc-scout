import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const userMessageSchema = z.object({
  message: z.string().min(1),
});
export type UserMessage = z.infer<typeof userMessageSchema>;
export const userMessageResolver = zodResolver(userMessageSchema);
