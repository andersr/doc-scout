import { deleteFromBucket } from "@services/cloudStore/deleteFromBucket";
import { getVectorStore } from "@services/vectorStore/getVectorStore";
import { redirect } from "react-router";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { requireRouteParam } from "~/.server/utils/requireRouteParam";
import { setNameSpace } from "~/config/namespaces";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import type { ActionHandlerFn } from "~/types/action";
import { SOURCE_INCLUDE } from "~/types/source";
import type { VectorMetadataFilter } from "~/types/vectorDoc";

export const deleteAction: ActionHandlerFn = async ({ params, request }) => {
  const { internalUser } = await requireUser({ request });

  const sourcePublicId = requireRouteParam({
    key: KEYS.id,
    params,
  });

  const source = await prisma.source.delete({
    include: SOURCE_INCLUDE,
    where: {
      ownerId: internalUser.id,
      publicId: sourcePublicId,
    },
  });

  if (!source.storagePath) {
    console.warn(
      `no storage path found, cannot delete from s3 for source: ${source.fileName}, ${source.publicId} `,
    );
  }
  if (source.storagePath) {
    await deleteFromBucket(source.storagePath);
  }

  const namespace = setNameSpace({
    prefix: "user",
    userPublicId: internalUser.publicId,
  });

  const vectorStore = await getVectorStore(namespace);
  vectorStore.delete({
    filter: {
      sourceId: { $eq: sourcePublicId },
    } satisfies VectorMetadataFilter,
    namespace,
  });

  const chatId = source.chats.length > 0 ? source.chats[0].chat?.id : undefined;
  if (!chatId) {
    console.warn("no chat id found, cannot delete associated chat");
  }

  if (chatId) {
    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    });
  }

  return redirect(appRoutes("/"));
};
