import path from "path";
import { redirect } from "react-router";
import { ENV } from "~/.server/ENV";
import { createSourcesAndAddToVectorStore } from "~/.server/models/sources/createSourcesAndAddToVectorStore";
import { setCreateSourcesRedirectRoute } from "~/.server/models/sources/setCreateSourcesRedirectRoute";
import { generateSummary } from "~/.server/services/agents/docSummary/generateSummary";
import { extractTextFromCloudStorePdf } from "~/.server/services/pdfExtract/extractTextFromCloudStorePdf";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { getMarkdownFromUrl } from "~/.server/services/webScrape/getMarkdownFromUrl";
import { KEYS } from "~/shared/keys";
import { type FileSourceInput, sourceInputArraySchema } from "~/types/source";
import type { ActionHandlerFn } from "../../../.server/utils/handleActionIntent";

export const filesAction: ActionHandlerFn = async ({ formData, request }) => {
  const { internalUser } = await requireUser({ request });

  const items = formData
    .getAll(KEYS.sourcesInput)
    .map((item) => JSON.parse(item.toString()));

  const sourcesFormData = sourceInputArraySchema.parse(items);

  const sourcesInput: FileSourceInput[] = [];

  for await (const formData of sourcesFormData) {
    let text: string;

    const fileExtension = path.extname(formData.storagePath).toLowerCase();

    if (fileExtension === ".pdf") {
      text = await extractTextFromCloudStorePdf(formData.storagePath);
    } else {
      // TODO: replace this with direct bucket GET
      const extractedText = await getMarkdownFromUrl(
        `${ENV.CDN_HOST}/${formData.storagePath}`,
      );
      text = extractedText || "";
    }

    const summary = await generateSummary({ text });

    sourcesInput.push({
      createdAt: new Date(),
      fileName: formData.fileName,
      ownerId: internalUser.id,
      publicId: formData.publicId,
      storagePath: formData.storagePath,
      summary,
      text,
      title: formData.fileName, // TODO: get from file content or suggest via bot
    });
  }

  const sources = await createSourcesAndAddToVectorStore({
    data: sourcesInput,
    userPublicId: internalUser.publicId,
  });

  const redirectRoute = setCreateSourcesRedirectRoute(sources);

  return redirect(redirectRoute);
};
