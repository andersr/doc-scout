import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  chatPublicId: z.string().min(1),
  namespace: z.string().min(1),
  query: z.string().min(1),
});
export type BotReply = z.infer<typeof schema>;
export const botReplyResolver = zodResolver(schema);
