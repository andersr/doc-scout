import type { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { redirect } from "react-router";
import { prisma } from "~/lib/prisma";
import { fileListSchema } from "~/lib/schemas/files";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { ServerError } from "~/types/server";
import { splitCsvText } from "~/utils/splitCsvText";
import type { ActionHandlers } from "../actions/handleActionIntent";
import { fcApp } from "../firecrawl/fcApp";
import { requireInternalUser } from "../sessions/requireInternalUser";
import { addSourceFromFiles } from "../sources/addSourcesFromFiles";
import { generateId } from "../utils/generateId";
import { isValidUrl } from "../utils/isValidUrl";
import { addSourcesToVectorStore } from "../vectorStore/addSourcesToVectorStore";

export const newDocActions: ActionHandlers = {
  files: async ({ formData, request }) => {
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
  },
  urls: async ({ formData, request }) => {
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
      const name = scrapeBatchResponse.data[index].metadata?.title ?? "";
      if (!name) {
        console.warn(
          `no title found for: ${scrapeBatchResponse.data[index].metadata}`,
        );
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
        name,
        ownerId: user.id,
        publicId: generateId(),
        text,
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
  },
};
