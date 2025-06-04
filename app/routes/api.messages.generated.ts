import { MessageType } from "@prisma/client";
import { getValidatedFormData } from "remix-hook-form";
import { generateGraph } from "~/.server/langchain/generateGraph";
import { requireUser } from "~/.server/sessions/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { serverError } from "~/.server/utils/serverError";
import { prisma } from "~/lib/prisma";
import { type BotReply, botReplyResolver } from "~/lib/schemas/botReply";
import type { ServerResponse } from "~/types/server";
import type { Route } from "./+types/api.messages.generated";

export async function action(args: Route.ActionArgs) {
  await requireUser(args);
  try {
    const {
      data,
      errors,
      receivedValues: defaultValues,
    } = await getValidatedFormData<BotReply>(args.request, botReplyResolver);

    if (errors) {
      return { defaultValues, errors, ok: false };
    }

    const chat = await prisma.chat.findFirstOrThrow({
      where: {
        publicId: data.chatPublicId,
      },
    });

    const graph = await generateGraph({
      namespace: data.namespace,
    });

    const inputs = {
      question: data.query,
    };

    const result = await graph.invoke(inputs);

    await prisma.message.create({
      data: {
        chatId: chat.id,
        createdAt: new Date(),
        publicId: generateId(),
        text: result.answer,
        type: MessageType.BOT,
      },
    });

    return {
      errors: null,
      ok: true,
    } satisfies ServerResponse;
  } catch (error) {
    console.error("error: ", error);
    return serverError(error);
  }
}
