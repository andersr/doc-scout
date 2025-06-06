import { prisma } from "~/lib/prisma";
import { ServerError } from "~/types/server";

export async function throwIfExistingSources({
  files,
  urls,
  userId,
}: {
  files?: File[];
  urls?: string[];
  userId: number;
}) {
  if (!files && !urls) {
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
            in: files?.map((f) => f.name),
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
