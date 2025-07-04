import { createSourcesChatsVectorStore } from "~/.server/models/sources/createSourcesChatsVectorStore";
import { getStytchUserByEmail } from "~/.server/vendors/stytch/getStytchUserByEmail";
import { prisma } from "~/lib/prisma";
import type { ActionHandlerFn } from "~/types/action";
import type { FileSourceInput } from "~/types/source";
import { USER_INTERNAL_INCLUDE } from "~/types/user";
import { MOCK_SOURCE } from "../../../../e2e/mocks/sources/mockSource";
import { upsertSourceSchema } from "../utils/e2eSchemas";

export const upsertDoc: ActionHandlerFn = async ({ formData }) => {
  const formPayload = Object.fromEntries(formData);
  const data = upsertSourceSchema.parse(formPayload);

  const stytchUser = await getStytchUserByEmail(data.email);

  const internalUser = await prisma.user.findFirstOrThrow({
    include: USER_INTERNAL_INCLUDE,
    where: {
      stytchId: stytchUser?.user_id ?? "",
    },
  });

  const existingSource = await prisma.source.findFirst({
    where: {
      publicId: data.sourcePublicId,
    },
  });

  if (!existingSource) {
    const sourceInput: FileSourceInput = {
      createdAt: new Date(),
      fileName: MOCK_SOURCE.fileName,
      ownerId: internalUser.id,
      publicId: data.sourcePublicId,
      storagePath: MOCK_SOURCE.storagePath,
      summary: MOCK_SOURCE.summary,
      text: MOCK_SOURCE.text,
      title: MOCK_SOURCE.title,
    };

    await createSourcesChatsVectorStore({
      data: [sourceInput],
      internalUser,
    });
  }

  return null;
};
