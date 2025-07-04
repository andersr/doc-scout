import { requireSourceChat } from "~/.server/utils/requireSourceChat";
import { prisma } from "~/lib/prisma";
import type { ActionHandlerFn } from "~/types/action";
import { SOURCE_INCLUDE } from "~/types/source";
import { deleteMessagesSchema } from "../utils/e2eSchemas";

export const deleteMessagesAction: ActionHandlerFn = async ({ formData }) => {
  const formPayload = Object.fromEntries(formData);
  const data = deleteMessagesSchema.parse(formPayload);

  const source = await prisma.source.findFirstOrThrow({
    include: SOURCE_INCLUDE,
    where: {
      publicId: data.sourcePublicId,
    },
  });

  const sourceChat = requireSourceChat({ source });

  await prisma.message.deleteMany({
    where: {
      id: {
        in: sourceChat.messages.map((m) => m.id),
      },
    },
  });

  return null;
};
