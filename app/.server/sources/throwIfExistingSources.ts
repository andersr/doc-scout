import { prisma } from "~/lib/prisma";
import { ServerError } from "~/types/server";

export async function throwIfExistingSources({
  fileNames,
  urls,
  userId,
}: {
  fileNames?: string[];
  urls?: string[];
  userId: number;
}) {
  if (!fileNames && !urls) {
    throw new ServerError("Nothing submitted.");
  }
  const existingSources = await prisma.source.findMany({
    where: {
      OR: [
        {
          url: {
            in: urls,
          },
        },
        {
          fileName: {
            in: fileNames,
          },
        },
      ],
      ownerId: userId,
    },
  });

  if (existingSources.length > 0) {
    throw new ServerError(
      `Sources already added: ${existingSources.map((s) => s.title).join(", ")}`,
    );
  }
}
