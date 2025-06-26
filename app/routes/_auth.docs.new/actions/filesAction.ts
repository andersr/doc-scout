import path from "path";
import { redirect } from "react-router";
import { ENV } from "~/.server/ENV";
import { createSourcesChatsVectorStore } from "~/.server/models/sources/createSourcesChatsVectorStore";
import { setCreateSourcesRedirectRoute } from "~/.server/models/sources/setCreateSourcesRedirectRoute";
import { generateSummary } from "~/.server/services/agents/docSummary/generateSummary";
import { extractTextFromCloudStorePdf } from "~/.server/services/pdfExtract/extractTextFromCloudStorePdf";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { getMarkdownFromUrl } from "~/.server/services/webScrape/getMarkdownFromUrl";
import { KEYS } from "~/shared/keys";
import type { ActionHandlerFn } from "~/types/action";
import { type FileSourceInput, sourceInputArraySchema } from "~/types/source";

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
      title: formData.fileName,
    });
  }

  const sources = await createSourcesChatsVectorStore({
    data: sourcesInput,
    internalUser,
  });

  const redirectRoute = setCreateSourcesRedirectRoute(sources);

  return redirect(redirectRoute);
};
