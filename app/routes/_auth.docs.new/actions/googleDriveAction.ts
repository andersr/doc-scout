import { generateSummary } from "@services/agents/docSummary/generateSummary";
import { redirect } from "react-router";
import { createSourcesChatsVectorStore } from "~/.server/models/sources/createSourcesChatsVectorStore";
import { setCreateSourcesRedirectRoute } from "~/.server/models/sources/setCreateSourcesRedirectRoute";
import { fetchGoogleDriveFile } from "~/.server/services/googleDrive/fetchGoogleDriveFile";
import { getCookieValue } from "~/.server/services/sessions/getCookieValue";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { KEYS } from "~/shared/keys";
import type { ActionHandlerFn } from "~/types/action";
import type { FileSourceInput } from "~/types/source";

export const googleDriveAction: ActionHandlerFn = async ({
  formData,
  request,
}) => {
  const { internalUser } = await requireUser({ request });

  const fileId = formData.get("fileId")?.toString();
  const fileName = formData.get("fileName")?.toString();
  const mimeType = formData.get("mimeType")?.toString();

  if (!fileId || !fileName || !mimeType) {
    throw new Error("Missing required Google Drive file information");
  }

  const accessToken = await getCookieValue({
    key: KEYS.access_token,
    request,
  });

  if (!accessToken) {
    throw new Error("Missing access token, cannot fetch Google Drive file");
  }

  // Fetch the file content from Google Drive
  const { text, title } = await fetchGoogleDriveFile({
    accessToken,
    fileId,
    fileName,
    mimeType,
  });

  const summary = await generateSummary({ text });

  const sourceInput: FileSourceInput = {
    createdAt: new Date(),
    fileName,
    ownerId: internalUser.id,
    publicId: crypto.randomUUID(),
    storagePath: null, // No storage path needed for Google Drive files
    summary,
    text,
    title: title || fileName,
  };

  const sources = await createSourcesChatsVectorStore({
    data: [sourceInput],
    internalUser,
  });

  const redirectRoute = setCreateSourcesRedirectRoute(sources);

  return redirect(redirectRoute);
};
