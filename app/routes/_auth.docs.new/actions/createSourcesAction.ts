import type { Prisma } from "@prisma/client";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import path from "path";
import { redirect } from "react-router";
import { ENV } from "~/.server/ENV";
import { extractPdfData } from "~/.server/services/pdfExtract/extractPdfData";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { addSourcesToVectorStore } from "~/.server/services/vectorStore/addSourcesToVectorStore";
import { getMarkdownFromUrl } from "~/.server/services/webScrape/getMarkdownFromUrl";
import { prisma } from "~/lib/prisma";
import { sourceInputArraySchema } from "~/lib/schemas/files";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { ServerError } from "~/types/server";
import { getFileFromS3 } from "~/utils/getFileFromS3";
import type { ActionHandlerFn } from "../../../.server/utils/handleActionIntent";

export const createSourcesAction: ActionHandlerFn = async ({
  formData,
  request,
}) => {
  const { internalUser } = await requireUser({ request });

  const items = formData
    .getAll(KEYS.sourcesInput)
    .map((item) => JSON.parse(item.toString()));
  const sourcesFormData = sourceInputArraySchema.parse(items);
  const sourcesInput: Prisma.SourceCreateManyInput[] = [];

  for await (const formData of sourcesFormData) {
    let text: string;

    const fileExtension = path.extname(formData.storagePath).toLowerCase();
    const isPdf = fileExtension === ".pdf";

    if (isPdf) {
      let localFilePath = "";
      try {
        localFilePath = await getFileFromS3(formData.storagePath);
        text = await extractPdfData(localFilePath);
      } catch (error) {
        console.error(
          `Failed to extract PDF data for ${formData.publicId}:`,
          error,
        );
        text = "";
      } finally {
        if (localFilePath && fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
      }
    } else {
      const extractedText = await getMarkdownFromUrl(
        `${ENV.CDN_HOST}/${formData.storagePath}`,
      );
      text = extractedText || "";
    }

    sourcesInput.push({
      createdAt: new Date(),
      fileName: formData.fileName,
      ownerId: internalUser.id,
      publicId: formData.publicId,
      storagePath: formData.storagePath,
      text,
      title: formData.fileName, // TODO: get from file content or suggest via bot
    });
  }

  if (sourcesInput.length === 0) {
    throw new ServerError("No sources submitted", StatusCodes.BAD_REQUEST);
  }

  const sources = await prisma.source.createManyAndReturn({
    data: sourcesInput,
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
