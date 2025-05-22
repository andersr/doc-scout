import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  message: z.string().min(1),
  sources: z.union([z.string(), z.string().array()]),
});
export type NewChat = z.infer<typeof schema>;

export const newChatSchema = {
  resolver: zodResolver(schema),
  schema,
};
