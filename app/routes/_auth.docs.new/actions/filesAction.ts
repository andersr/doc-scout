import { redirect } from "react-router";
import { openAiClient } from "~/.server/openai/client";
import { CREATE_BLURB_INSTRUCTIONS } from "~/data/prompts/createBlurb";
import { prisma } from "~/lib/prisma";
import { fileListSchema } from "~/lib/schemas/files";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import type { ActionHandlerFn } from "../../../.server/actions/handleActionIntent";
import { generateS3Key } from "../../../.server/services/generateS3Key";
import { uploadFileToS3 } from "../../../.server/services/uploadFileToS3";
import { requireInternalUser } from "../../../.server/sessions/requireInternalUser";
import { addSourceFromFiles } from "../../../.server/sources/addSourcesFromFiles";
import { generateId } from "../../../.server/utils/generateId";
import { addSourcesToVectorStore } from "../../../.server/vectorStore/addSourcesToVectorStore";

export const filesAction: ActionHandlerFn = async ({ formData, request }) => {
  const user = await requireInternalUser({ request });

  const submittedFiles = formData
    .getAll(KEYS.files)
    .filter((f) => f instanceof File);

  const files = fileListSchema.parse(submittedFiles);

  const fileDataMap = new Map<
    string,
    { publicId: string; storagePath: string }
  >();

  for (const file of files) {
    const sourcePublicId = generateId();
    const s3Key = generateS3Key({
      fileName: file.name,
      sourcePublicId,
      userPublicId: user.publicId,
    });

    await uploadFileToS3({ file, key: s3Key });
    fileDataMap.set(file.name, {
      publicId: sourcePublicId,
      storagePath: s3Key,
    });
  }

  const sources = await addSourceFromFiles({
    fileDataMap,
    files,
    userId: user.id,
  });

  for await (const source of sources) {
    const response = await openAiClient.responses.create({
      input: `Create a blurb for the following content:
      
      ${source.text}`,
      instructions: CREATE_BLURB_INSTRUCTIONS,
      model: "gpt-4.1-mini",
    });

    await prisma.source.update({
      data: {
        summary: response.output_text,
      },
      where: {
        id: source.id,
      },
    });
  }

  await addSourcesToVectorStore({ sources, userPublicId: user.publicId });

  const redirectRoute =
    sources.length === 1
      ? appRoutes("/docs/:id", { id: sources[0].publicId })
      : appRoutes("/docs");

  return redirect(redirectRoute);
};
