import { StatusCodes } from "http-status-codes";
import { redirect } from "react-router";
import { throwIfExistingSources } from "~/.server/models/sources/throwIfExistingSources";
import { generateAbstract } from "~/.server/services/agents/docSummary/generateAbstract";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { addSourcesToVectorStore } from "~/.server/services/vectorStore/addSourcesToVectorStore";
import { batchScrapeUrls } from "~/.server/services/webScrape/batchScrapeUrls";
import { generateId } from "~/.server/utils/generateId";
import { prisma } from "~/lib/prisma";
import { urlListSchema } from "~/lib/schemas/urls";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { ServerError } from "~/types/server";
import type { UrlSourceInput } from "~/types/source";
import { splitCsvText } from "~/utils/splitCsvText";
import type { ActionHandlerFn } from "../../../.server/utils/handleActionIntent";

export const urlsAction: ActionHandlerFn = async ({ formData, request }) => {
  const { internalUser } = await requireUser({ request });

  const urlsInput = String(formData.get(KEYS.urls) || "");

  // TODO: confirm still erroring if no urls submitted
  const maybeUrls = splitCsvText(urlsInput);

  const urls = urlListSchema.parse(maybeUrls);

  await throwIfExistingSources({
    urls,
    userId: internalUser.id,
  });

  const urlDataItems = await batchScrapeUrls({ urls });

  const urlsDbInput: UrlSourceInput[] = [];

  for await (const urlData of urlDataItems) {
    const title = urlData.metadata?.title ?? "";
    if (!title) {
      console.warn(`no title found for: ${urlData.metadata}`);
      // TODO: generate a title
    }
    const text = urlData.markdown;
    if (!text) {
      console.warn(`no text found for: ${urlData.metadata}`);
      continue;
    }

    const summary = await generateAbstract({ text });
    const url = urlData.metadata?.url;
    if (!url) {
      console.warn(`no url found for: ${urlData.metadata}`);
      continue;
    }

    urlsDbInput.push({
      ownerId: internalUser.id,
      summary,
      text,
      title,
      url,
    });
  }

  if (urlsDbInput.length === 0) {
    throw new ServerError(
      `No source inputs to add. Please check source input data.`,
      StatusCodes.BAD_GATEWAY,
    );
  }

  const sources = await prisma.source.createManyAndReturn({
    data: urlsDbInput.map((f) => ({
      createdAt: new Date(),
      name: f.title, // legacy
      publicId: generateId(),
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
