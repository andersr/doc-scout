import type { Source } from "@prisma/client";

type BaseSourceInput = Required<Pick<Source, "title" | "ownerId" | "text">> &
  Partial<Pick<Source, "summary">>;

export type UrlSourceInput = BaseSourceInput & Required<Pick<Source, "url">>;

export type FileSourceInput = BaseSourceInput &
  Required<Pick<Source, "storagePath" | "fileName" | "publicId">>;
