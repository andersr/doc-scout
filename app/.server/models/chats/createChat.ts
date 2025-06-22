import { generateId } from "~/.server/utils/generateId";
import { prisma } from "~/lib/prisma";

export async function createChat({
  sourcePublicId,
  userId,
}: {
  sourcePublicId: string;
  userId: number;
}) {
  const source = await prisma.source.findUniqueOrThrow({
    where: {
      publicId: sourcePublicId,
    },
  });

  const chat = await prisma.chat.create({
    data: {
      createdAt: new Date(),
      ownerId: userId,
      publicId: generateId(),
      sources: {
        create: {
          sourceId: source.id,
        },
      },
    },
  });

  return chat;
}
