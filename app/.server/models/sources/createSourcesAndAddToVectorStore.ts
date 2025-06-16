import { addSourcesToVectorStore } from "~/.server/services/vectorStore/addSourcesToVectorStore";
import { prisma } from "~/lib/prisma";
import type { FileSourceInput, UrlSourceInput } from "~/types/source";

/**
 * Assumes use within a try/catch block
 */
export async function createSourcesAndAddToVectorStore({
  data,
  userPublicId,
}: {
  data: UrlSourceInput[] | FileSourceInput[];
  userPublicId: string;
}) {
  const sources = await prisma.source.createManyAndReturn({
    data,
  });

  await addSourcesToVectorStore({
    sources,
    userPublicId,
  });

  return sources;
}
