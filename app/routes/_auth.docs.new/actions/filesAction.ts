import { redirect } from "react-router";
import { fileListSchema } from "~/lib/schemas/files";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import type { ActionHandlerFn } from "../../../.server/actions/handleActionIntent";
import { requireInternalUser } from "../../../.server/sessions/requireInternalUser";
import { addSourceFromFiles } from "../../../.server/sources/addSourcesFromFiles";
import { addSourcesToVectorStore } from "../../../.server/vectorStore/addSourcesToVectorStore";
import { uploadFileToS3 } from "../../../.server/services/uploadFileToS3";
import { generateS3Key } from "../../../.server/services/generateS3Key";
import { generateId } from "../../../.server/utils/generateId";

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

  await addSourcesToVectorStore({ sources, userPublicId: user.publicId });

  const redirectRoute =
    sources.length === 1
      ? appRoutes("/docs/:id", { id: sources[0].publicId })
      : appRoutes("/docs");

  return redirect(redirectRoute);
};
