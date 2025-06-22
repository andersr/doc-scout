import { prisma } from "~/lib/prisma";
import { TEST_KEYS } from "~/shared/testKeys";
import type { ActionHandlerFn } from "~/types/action";
import type { TestActionResponse } from "~/types/testActions";

export const deleteChatAction: ActionHandlerFn = async ({ formData }) => {
  const formPayload = Object.fromEntries(formData);
  const chatPublicId = formPayload[TEST_KEYS.chatPublicId];

  if (!chatPublicId) {
    throw new Error("no chatPublicId");
  }

  await prisma.chat.delete({
    where: {
      publicId: chatPublicId.toString(),
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
