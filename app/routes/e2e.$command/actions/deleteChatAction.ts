import type { TestActionResponse } from "~/__test__/actions";
import { TEST_KEYS } from "~/__test__/keys";
import { prisma } from "~/lib/prisma";
import type { ActionHandlerFn } from "~/types/action";

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
