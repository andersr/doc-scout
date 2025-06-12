import type { Source } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { redirect } from "react-router";
import { ENV } from "~/.server/ENV";
import { getMarkdownFromUrl } from "~/.server/services/getMarkdownFromUrl";
import { requireUser } from "~/.server/sessions/requireUser";
import { addSourcesToVectorStore } from "~/.server/vectorStore/addSourcesToVectorStore";
import { prisma } from "~/lib/prisma";
import { sourceIdListSchema } from "~/lib/schemas/files";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { ServerError } from "~/types/server";
import type { ActionHandlerFn } from "../../../.server/actions/handleActionIntent";
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

    const text = await getMarkdownFromUrl(
      `${ENV.CDN_HOST}/${source.storagePath}`,
    );

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
