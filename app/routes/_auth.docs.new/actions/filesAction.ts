import { redirect } from "react-router";
import { extractTextFromFile } from "~/.server/services/extractTextFromFile";
import { requireUser } from "~/.server/sessions/requireUser";
import { generateAbstract } from "~/.server/sources/generateAbstract";
import { throwIfExistingSources } from "~/.server/sources/throwIfExistingSources";
import { prisma } from "~/lib/prisma";
import { fileListSchema } from "~/lib/schemas/files";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import type { FileSourceInput } from "~/types/source";
import type { ActionHandlerFn } from "../../../.server/actions/handleActionIntent";
import { generateS3Key } from "../../../.server/services/generateS3Key";
import { uploadFileToS3 } from "../../../.server/services/uploadFileToS3";
import { generateId } from "../../../.server/utils/generateId";
import { addSourcesToVectorStore } from "../../../.server/vectorStore/addSourcesToVectorStore";

export const filesAction: ActionHandlerFn = async ({ formData, request }) => {
  const { internalUser } = await requireUser({ request });

  const submittedFiles = formData
    .getAll(KEYS.files)
    .filter((f) => f instanceof File);

  const files = fileListSchema.parse(submittedFiles);

  await throwIfExistingSources({
    files,
    userId: internalUser.id,
  });

  const filesDbInput: FileSourceInput[] = [];

  for await (const file of files) {
    const publicId = generateId();
    const storagePath = generateS3Key({
      fileName: file.name,
      sourcePublicId: publicId,
      userPublicId: internalUser.publicId,
    });

    await uploadFileToS3({ file, key: storagePath });

    const text = await extractTextFromFile(file);
    const summary = await generateAbstract({ text });

    filesDbInput.push({
      fileName: file.name,
      ownerId: internalUser.id,
      publicId,
      storagePath,
      summary,
      text,
      title: file.name, // TODO: get from file content or suggest via bot
    });
  }

  const sources = await prisma.source.createManyAndReturn({
    data: filesDbInput.map((f) => ({
      createdAt: new Date(),
      ...f,
    })),
  });

  await addSourcesToVectorStore({
    sources,
    userPublicId: internalUser.publicId,
  });

  const redirectRoute =
    sources.length === 1
      ? appRoutes("/docs/:id", { id: sources[0].publicId })
      : appRoutes("/docs");

  return redirect(redirectRoute);
};
