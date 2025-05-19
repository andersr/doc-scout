import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  message: z.string().min(1),
});
export type UserMessage = z.infer<typeof schema>;
export const userMessageResolver = zodResolver(schema);
