import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  collectionId: z.string().min(1),
});
export type NewQuery = z.infer<typeof schema>;
export const newQueryResolver = zodResolver(schema);
