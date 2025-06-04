import type { Source } from "@prisma/client";
import { FALLBACK_TITLE } from "~/config/sources";

export function setSourceTitle(source: Source) {
  return source.title ?? source.name ?? source.fileName ?? FALLBACK_TITLE;
}
