import type { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { redirect } from "react-router";
import { fcApp } from "~/.server/firecrawl/fcApp";
import { generateId } from "~/.server/utils/generateId";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { ServerError } from "~/types/server";
import { isValidUrl } from "~/utils/isValidUrl";
import { splitCsvText } from "~/utils/splitCsvText";
import type { ActionHandlerFn } from "../../../.server/actions/handleActionIntent";
import { requireInternalUser } from "../../../.server/sessions/requireInternalUser";
import { addSourcesToVectorStore } from "../../../.server/vectorStore/addSourcesToVectorStore";

export const urlsAction: ActionHandlerFn = async ({ formData, request }) => {
  const user = await requireInternalUser({ request });
  const urlsInput = String(formData.get(KEYS.urls) || "");

  if (!urlsInput || urlsInput.trim() === "") {
    throw new ServerError(
      "At least one URL is required.",
      StatusCodes.BAD_REQUEST,
    );
  }

  const urls = splitCsvText(urlsInput);

  for (let index = 0; index < urls.length; index++) {
    if (!isValidUrl(urls[index])) {
      throw new ServerError(
        `Invalid url: ${urls[index]}`,
        StatusCodes.BAD_REQUEST,
      );
    }
  }

  const existingSources = await prisma.source.findMany({
    where: {
      ownerId: user.id,
      url: {
        in: urls,
      },
    },
  });

  if (existingSources.length > 0) {
    throw new ServerError(
      `Some URLs have already been added: ${existingSources.map((s) => s.url).join(", ")}`,
      StatusCodes.BAD_REQUEST,
    );
  }

  const scrapeBatchResponse = await fcApp.batchScrapeUrls(urls, {
    formats: ["markdown"],
  });

  if (!scrapeBatchResponse.success) {
    throw new ServerError(
      `Failed to get url data: ${scrapeBatchResponse.error}`,
      StatusCodes.BAD_GATEWAY,
    );
  }

  const sourcesInput: Prisma.SourceCreateManyInput[] = [];

  for (let index = 0; index < scrapeBatchResponse.data.length; index++) {
    const title = scrapeBatchResponse.data[index].metadata?.title ?? "";
    if (!title) {
      console.warn(
        `no title found for: ${scrapeBatchResponse.data[index].metadata}`,
      );
      // TODO: generate a title
    }
    const text = scrapeBatchResponse.data[index].markdown;
    if (!text) {
      console.warn(
        `no text found for: ${scrapeBatchResponse.data[index].metadata}`,
      );
      continue;
    }
    const url = scrapeBatchResponse.data[index].metadata?.url;
    if (!url) {
      console.warn(
        `no url found for: ${scrapeBatchResponse.data[index].metadata}`,
      );
      continue;
    }

    sourcesInput.push({
      createdAt: new Date(),
      name: title, // legacy
      ownerId: user.id,
      publicId: generateId(),
      text,
      title,
      url,
    });
  }

  if (sourcesInput.length === 0) {
    throw new ServerError(
      `No source inputs to add.  Please check source input data.`,
      StatusCodes.BAD_GATEWAY,
    );
  }

  const sources = await prisma.source.createManyAndReturn({
    data: sourcesInput,
  });

  await addSourcesToVectorStore({ sources, userPublicId: user.publicId });

  const redirectRoute =
    sources.length === 1
      ? appRoutes("/docs/:id", { id: sources[0].publicId })
      : appRoutes("/docs");

  return redirect(redirectRoute);
};
