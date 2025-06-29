import { addSourcesToVectorStore } from "@services/vectorStore/addSourcesToVectorStore";
import { generateId } from "~/.server/utils/generateId";
import { prisma } from "~/lib/prisma";
import type { FileSourceInput, UrlSourceInput } from "~/types/source";
import type { UserInternal } from "~/types/user";

export async function createSourcesChatsVectorStore({
  data,
  internalUser,
}: {
  data: UrlSourceInput[] | FileSourceInput[];
  internalUser: UserInternal;
}) {
  const sources = await prisma.source.createManyAndReturn({
    data,
  });

  for await (const source of sources) {
    await prisma.chat.create({
      data: {
        createdAt: new Date(),
        ownerId: internalUser.id,
        publicId: generateId(),
        sources: {
          create: {
            sourceId: source.id,
          },
        },
      },
    });
  }

  await addSourcesToVectorStore({
    sources,
    userPublicId: internalUser.publicId,
  });

  return sources;
}
