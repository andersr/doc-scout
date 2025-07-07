import { MessageType } from "@prisma/client";
import { answerQuery } from "@services/agents/docQuery/answerQuery";
import { requireSourceAndSourceChat } from "~/.server/models/sources/requireSourceAndSourceChat";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { generateId } from "~/.server/utils/generateId";
import getFormData from "~/.server/utils/getFormData";
import { setNameSpace } from "~/config/namespaces";
// import { getNameSpace } from "~/config/namespaces";
import { prisma } from "~/lib/prisma";
import { userMessageSchema } from "~/lib/schemas/userMessage";
import type { ActionHandlerFn } from "~/types/action";

export const chatAction: ActionHandlerFn = async ({ params, request }) => {
  const { internalUser } = await requireUser({ request });

  const { source, sourceChat } = await requireSourceAndSourceChat({ params });

  const formData = await getFormData({ request });
  const input = userMessageSchema.parse(formData);

  await prisma.message.create({
    data: {
      authorId: internalUser.id,
      chatId: sourceChat.id,
      createdAt: new Date(),
      publicId: generateId(),
      text: input.message,
    },
  });

  const botAnswer = await answerQuery({
    namespace: setNameSpace({
      prefix: "user",
      userPublicId: internalUser.publicId,
    }),
    query: input.message,
    sourceIds: [source.publicId],
  });

  await prisma.message.create({
    data: {
      chatId: sourceChat.id,
      createdAt: new Date(),
      publicId: generateId(),
      text: botAnswer,
      type: MessageType.BOT,
    },
  });

  return null;
};
