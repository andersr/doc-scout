import { redirect } from "react-router";
import { createSourcesChatsVectorStore } from "~/.server/models/sources/createSourcesChatsVectorStore";
import { setCreateSourcesRedirectRoute } from "~/.server/models/sources/setCreateSourcesRedirectRoute";
import { throwIfExistingSources } from "~/.server/models/sources/throwIfExistingSources";
import { generateSummary } from "~/.server/services/agents/docSummary/generateSummary";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { batchScrapeUrls } from "~/.server/services/webScrape/batchScrapeUrls";
import { generateId } from "~/.server/utils/generateId";
import { urlListSchema } from "~/lib/schemas/urls";
import { KEYS } from "~/shared/keys";
import type { ActionHandlerFn } from "~/types/action";
import type { UrlSourceInput } from "~/types/source";
import { splitCsvText } from "~/utils/splitCsvText";

export const urlsAction: ActionHandlerFn = async ({ formData, request }) => {
  const { internalUser } = await requireUser({ request });

  const urlsInput = String(formData.get(KEYS.urls) || "");

  const maybeUrls = splitCsvText(urlsInput);

  const urls = urlListSchema.parse(maybeUrls);

  await throwIfExistingSources({
    urls,
    userId: internalUser.id,
  });

  const urlDataItems = await batchScrapeUrls({ urls });

  const sourcesInput: UrlSourceInput[] = [];

  for await (const urlData of urlDataItems) {
    const title = urlData.metadata?.title ?? "";
    if (!title) {
      console.warn(`no title found for: ${urlData.metadata}`);
    }
    const text = urlData.markdown;
    if (!text) {
      console.warn(`no text found for: ${urlData.metadata}`);
      continue;
    }

    const summary = await generateSummary({ text });

    const url = urlData.metadata?.url;
    if (!url) {
      console.warn(`no url found for: ${urlData.metadata}`);
      continue;
    }

    sourcesInput.push({
      createdAt: new Date(),
      ownerId: internalUser.id,
      publicId: generateId(),
      summary,
      text,
      title,
      url,
    });
  }

  const sources = await createSourcesChatsVectorStore({
    data: sourcesInput,
    internalUser,
  });

  const redirectRoute = setCreateSourcesRedirectRoute(sources);

  return redirect(redirectRoute);
};
