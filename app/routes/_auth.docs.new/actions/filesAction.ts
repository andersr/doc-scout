import { redirect } from "react-router";
import { fileListSchema } from "~/lib/schemas/files";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import type { ActionHandlerFn } from "../../../.server/actions/handleActionIntent";
import { requireInternalUser } from "../../../.server/sessions/requireInternalUser";
import { addSourceFromFiles } from "../../../.server/sources/addSourcesFromFiles";
import { addSourcesToVectorStore } from "../../../.server/vectorStore/addSourcesToVectorStore";

export const filesAction: ActionHandlerFn = async ({ formData, request }) => {
  const user = await requireInternalUser({ request });

  const submittedFiles = formData
    .getAll(KEYS.files)
    .filter((f) => f instanceof File);

  const files = fileListSchema.parse(submittedFiles);

  const sources = await addSourceFromFiles({ files, userId: user.id });

  await addSourcesToVectorStore({ sources, userPublicId: user.publicId });

  const redirectRoute =
    sources.length === 1
      ? appRoutes("/docs/:id", { id: sources[0].publicId })
      : appRoutes("/docs");

  return redirect(redirectRoute);
};
