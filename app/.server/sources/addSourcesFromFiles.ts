import type { Prisma } from "@prisma/client";
import console from "console";
import { prisma } from "~/lib/prisma";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { generateId } from "../utils/generateId";

export async function addSourceFromFiles({
  fileDataMap,
  files,
  userId,
}: {
  fileDataMap?: Map<string, { publicId: string; storagePath: string }>;
  files: File[];
  userId: number;
}) {
  const data: Prisma.SourceCreateManyInput[] = [];

  try {
    for await (const file of files) {
      const fileContent = await file.text();
      const fileData = fileDataMap?.get(file.name);
      const sourcePublicId = fileData?.publicId || generateId();

      data.push({
        createdAt: new Date(),
        fileName: file.name,
        ownerId: userId,
        publicId: sourcePublicId,
        storagePath: fileData?.storagePath,
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
