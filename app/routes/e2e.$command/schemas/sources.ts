import { z } from "zod";

// type BaseSourceInput = Required<
//   Pick<
//     Source,
//     "title" | "ownerId" | "text" | "createdAt" | "publicId" | "summary"
//   >
// > &
//   Partial<Pick<Source, "summary">>;

// export type UrlSourceInput = BaseSourceInput & Required<Pick<Source, "url">>;

// export type FileSourceInput = BaseSourceInput &
//   Required<Pick<Source, "storagePath" | "publicId" | "fileName">>;

// TODO: unused
export const sourceInputSchema = z.object({
  username: z.string().min(1),
});
// export type SourceInput = z.infer<typeof sourceInputSchema>;

// export const sourceInputArraySchema = z
//   .array(sourceInputSchema)
//   .refine((list) => list.length > 0, "No sources selected");
