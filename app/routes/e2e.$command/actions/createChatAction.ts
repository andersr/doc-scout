import { createChat } from "~/.server/models/chats/createChat";
import { addSourcesToVectorStore } from "~/.server/services/vectorStore/addSourcesToVectorStore";
import { MOCK_SOURCE } from "~/__mocks__/sources";
import { prisma } from "~/lib/prisma";
import { createChatSchema } from "~/routes/e2e.$command/utils/e2eSchemas";
import type { ActionHandlerFn } from "~/types/action";
import type { TestActionResponse } from "~/types/testActions";

// TODO: unused?
export const createChatAction: ActionHandlerFn = async ({ formData }) => {
  const formPayload = Object.fromEntries(formData);
  const data = createChatSchema.parse(formPayload);

  const user = await prisma.user.findFirstOrThrow({
    where: {
      email: data.email,
    },
  });

  let source = await prisma.source.findFirst({
    where: {
      publicId: data.sourcePublicId,
    },
  });

  if (!source) {
    // TODO: same as in upsertDoc action
    source = await prisma.source.create({
      data: {
        createdAt: new Date(),
        fileName: MOCK_SOURCE.fileName,
        ownerId: user.id,
        publicId: data.sourcePublicId,
        storagePath: MOCK_SOURCE.storagePath,
        summary: MOCK_SOURCE.summary,
        text: MOCK_SOURCE.text,
        title: MOCK_SOURCE.title,
      },
    });

    await addSourcesToVectorStore({
      sources: [source],
      userPublicId: user.publicId,
    });
  }

  const chat = await createChat({
    sourcePublicId: source.publicId,
    userId: user.id,
  });

  return new Response(
    JSON.stringify({
      chatPublicId: chat.publicId,
      ok: true,
    } satisfies TestActionResponse),
    {
      status: 200,
    },
  );
};
