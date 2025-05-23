import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  message: z.string().min(1),
  sources: z.union([z.string(), z.string().array()]),
});
export type NewQuery = z.infer<typeof schema>;

export const newQuerySchema = {
  resolver: zodResolver(schema),
  schema,
};
