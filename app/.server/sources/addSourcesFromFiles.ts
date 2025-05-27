import type { Prisma } from "@prisma/client";
import console from "console";
import { prisma } from "~/lib/prisma";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { generateId } from "../utils/generateId";

export async function addSourceFromFiles({
  files,
  userId,
}: {
  files: File[];
  userId: number;
}) {
  const data: Prisma.SourceCreateManyInput[] = [];

  try {
    for await (const file of files) {
      const fileContent = await file.text();
      data.push({
        createdAt: new Date(),
        fileName: file.name,
        ownerId: userId,
        publicId: generateId(),
        text: fileContent,
      });
    }

    return await prisma.source.createManyAndReturn({
      data,
    });
  } catch (err) {
    console.error(err);

    throw new Error(INTENTIONALLY_GENERIC_ERROR_MESSAGE);
  }
}
