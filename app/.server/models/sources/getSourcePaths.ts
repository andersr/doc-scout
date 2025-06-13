import type { Source } from "@prisma/client";

export function getSourcePaths(sources: Source[]) {
  return sources.map((s) => s.storagePath).filter((p) => p !== null);
}
