import { requireSourceChat } from "~/.server/utils/requireSourceChat";
import { prisma } from "~/lib/prisma";
import { TEST_KEYS } from "~/shared/testKeys";
import type { ActionHandlerFn } from "~/types/action";
import { SOURCE_INCLUDE } from "~/types/source";
import type { TestActionResponse } from "~/types/testActions";

export const deleteMessagesAction: ActionHandlerFn = async ({ formData }) => {
  const formPayload = Object.fromEntries(formData);
  const sourcePublicId = formPayload[TEST_KEYS.sourcePublicId];

  if (!sourcePublicId) {
    throw new Error("no sourcePublicId");
  }

  const source = await prisma.source.findFirstOrThrow({
    include: SOURCE_INCLUDE,
    where: {
      publicId: sourcePublicId.toString(),
    },
  });

  // const sourceChat = source.chats.length > 0 ? source.chats[0].chat : undefined;

  // if (!sourceChat) {
  //   throw new ServerError("No source chat found.");
  // }
  const sourceChat = requireSourceChat({ source });

  await prisma.message.deleteMany({
    where: {
      id: {
        in: sourceChat.messages.map((m) => m.id),
      },
    },
  });

  return new Response(
    JSON.stringify({
      ok: true,
    } satisfies TestActionResponse),
    {
      status: 200,
    },
  );
};
