import { data } from "react-router";
import { createPresignedUrl } from "~/.server/aws/createPresignedUrl";
import { generateS3Key } from "~/.server/services/generateS3Key";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { throwIfExistingSources } from "~/.server/sources/throwIfExistingSources";
import { generateId } from "~/.server/utils/generateId";
import { serverError } from "~/.server/utils/serverError";
import { prisma } from "~/lib/prisma";
import { fileNameListSchema } from "~/lib/schemas/files";
import { KEYS } from "~/shared/keys";
import type { SourceInitResponse } from "~/types/files";
import type { FileSourceInput } from "~/types/source";
import type { Route } from "./+types/api.sources";

export async function action(args: Route.ActionArgs) {
  const { internalUser } = await requireUser(args);
  try {
    const clone = args.request.clone();
    const formData = await clone.formData();
    const submittedFiles = formData.getAll(KEYS.fileNames);

    const fileNames = fileNameListSchema.parse(submittedFiles);

    await throwIfExistingSources({
      fileNames,
      userId: internalUser.id,
    });

    const items: SourceInitResponse[] = [];
    const filesDbInput: FileSourceInput[] = [];

    for await (const fileName of fileNames) {
      const sourcePublicId = generateId();
      const storagePath = generateS3Key({
        fileName,
        sourcePublicId,
        userPublicId: internalUser.publicId,
      });

      const signedUrl = await createPresignedUrl({ key: storagePath });

      filesDbInput.push({
        fileName,
        ownerId: internalUser.id,
        publicId: sourcePublicId,
        storagePath,
        text: "",
        title: fileName, // TODO: get from file content or suggest via bot
      });

      items.push({
        fileName,
        signedUrl,
        sourcePublicId,
      });
    }

    await prisma.source.createMany({
      data: filesDbInput.map((f) => {
        return {
          ...f,
          createdAt: new Date(),
        };
      }),
    });

    return data({ items }, { status: 200 });
  } catch (error) {
    console.error("error: ", error);
    return serverError(error);
  }
}
