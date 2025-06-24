import type { Prisma, Source } from "@prisma/client";
import { z } from "zod";
import { ID_DEFAULT_LENGTH } from "~/config/ids";

type BaseSourceInput = Required<
  Pick<
    Source,
    "title" | "ownerId" | "text" | "createdAt" | "publicId" | "summary"
  >
> &
  Partial<Pick<Source, "summary">>;

export type UrlSourceInput = BaseSourceInput & Required<Pick<Source, "url">>;

export type FileSourceInput = BaseSourceInput &
  Required<Pick<Source, "storagePath" | "publicId" | "fileName">>;

const sourceInputSchema = z.object({
  fileName: z.string().min(1),
  publicId: z.string().min(ID_DEFAULT_LENGTH),
  storagePath: z.string().min(1),
});
export type SourceInput = z.infer<typeof sourceInputSchema>;

export const sourceInputArraySchema = z
  .array(sourceInputSchema)
  .refine((list) => list.length > 0, "No sources selected");

export const SOURCE_INCLUDE = {
  chats: {
    include: {
      chat: {
        include: {
          messages: {
            include: {
              author: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  },
} as const;

export type SourceWithRelations = Prisma.SourceGetPayload<{
  include: typeof SOURCE_INCLUDE;
}>;
