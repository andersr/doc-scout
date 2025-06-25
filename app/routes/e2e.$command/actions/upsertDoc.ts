import { createSourcesChatsVectorStore } from "~/.server/models/sources/createSourcesChatsVectorStore";
import { prisma } from "~/lib/prisma";
import type { ActionHandlerFn } from "~/types/action";
import type { FileSourceInput } from "~/types/source";
import type { TestActionResponse } from "~/types/testActions";
import { USER_INTERNAL_INCLUDE } from "~/types/user";
import { getStytchUser } from "../../../.server/services/auth/getStytchUser";
import { MOCK_SOURCE } from "../../../__mocks__/sources";
import { upsertSourceSchema } from "../utils/e2eSchemas";

export const upsertDoc: ActionHandlerFn = async ({ formData }) => {
  const formPayload = Object.fromEntries(formData);
  const data = upsertSourceSchema.parse(formPayload);

  const stytchUser = await getStytchUser({ email: data.email });

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

  return new Response(
    JSON.stringify({ ok: true } satisfies TestActionResponse),
    {
      status: 200,
    },
  );
};
