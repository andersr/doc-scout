import { z } from "zod";
import { isValidFilename } from "~/utils/isValidFilename";

export const upsertSourceSchema = z.object({
  email: z.string().email(),
  sourcePublicId: z.string().min(1),
});
export type UpsertSourceInput = z.infer<typeof upsertSourceSchema>;

export const deleteAllUserSourcesSchema = z.object({
  email: z.string().email(),
});
export type DeleteAllUserSourcesInput = z.infer<
  typeof deleteAllUserSourcesSchema
>;

export const deleteSourceSchema = z.object({
  sourcePublicId: z.string().min(1),
});

export const deleteSourcesByNameSchema = z.object({
  sourceNames: z
    .string()
    .transform((value) => value.split(","))
    .pipe(z.string().refine(isValidFilename).array()),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createChatSchema = z.object({
  email: z.string().email(),
  sourcePublicId: z.string().min(1),
});

export const deleteMessagesSchema = z.object({
  sourcePublicId: z.string().min(1),
});
export type DeleteMessagesInput = z.infer<typeof deleteMessagesSchema>;
