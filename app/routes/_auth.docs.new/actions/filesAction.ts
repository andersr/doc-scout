import type { Source } from "@prisma/client";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import path from "path";
import { redirect } from "react-router";
import { ENV } from "~/.server/ENV";
import { extractPdfData } from "~/.server/services/extractPdfData";
import { getMarkdownFromUrl } from "~/.server/services/getMarkdownFromUrl";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { addSourcesToVectorStore } from "~/.server/services/vectorStore/addSourcesToVectorStore";
import { prisma } from "~/lib/prisma";
import { sourceIdListSchema } from "~/lib/schemas/files";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { ServerError } from "~/types/server";
import { getFileFromS3 } from "~/utils/getFileFromS3";
import type { ActionHandlerFn } from "../../../.server/utils/handleActionIntent";
export const filesAction: ActionHandlerFn = async ({ formData, request }) => {
  const { internalUser } = await requireUser({ request });

  const items = formData.getAll(KEYS.ids);
  const sourcePublicIds = sourceIdListSchema.parse(items);
  const sources: Source[] = [];

  for await (const publicId of sourcePublicIds) {
    const source = await prisma.source.findFirst({
      where: {
        publicId,
      },
    });

    if (!source) {
      console.warn(`No source found for id: ${publicId}`);
      continue;
    }

    if (!source.storagePath) {
      console.warn(`No storage path found for id: ${publicId}`);
      continue;
    }

    let text: string;

    const fileExtension = path.extname(source.storagePath).toLowerCase();
    const isPdf = fileExtension === ".pdf";
    console.info("isPdf: ", isPdf);

    if (isPdf) {
      let localFilePath = "";
      try {
        localFilePath = await getFileFromS3(source.storagePath);
        text = await extractPdfData(localFilePath);
      } catch (error) {
        console.error(`Failed to extract PDF data for ${publicId}:`, error);
        // const fallbackText = await getMarkdownFromUrl(
        //   `${ENV.CDN_HOST}/${source.storagePath}`,
        // );
        text = "";
      } finally {
        if (localFilePath && fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
      }
    } else {
      const extractedText = await getMarkdownFromUrl(
        `${ENV.CDN_HOST}/${source.storagePath}`,
      );
      text = extractedText || "";
    }

    const updated = await prisma.source.update({
      data: { text },
      where: { id: source.id },
    });

    sources.push(updated);
  }

  if (sources.length === 0) {
    throw new ServerError(
      "No matching sources found for submitted ids",
      StatusCodes.BAD_REQUEST,
    );
  }
  await addSourcesToVectorStore({
    sources,
    userPublicId: internalUser.publicId,
  });

  const redirectRoute =
    sourcePublicIds.length === 1
      ? appRoutes("/docs/:id", { id: sourcePublicIds[0] })
      : appRoutes("/docs");

  return redirect(redirectRoute);
};
