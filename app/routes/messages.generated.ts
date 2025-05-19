import { MessageType } from "@prisma/client";
import { getValidatedFormData } from "remix-hook-form";
import { apiError } from "~/.server/api/apiError";
import { generateGraph } from "~/.server/langchain/generateGraph";
import { requireUser } from "~/.server/users/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { type AnswerFormTypes, answerSchemaResolver } from "~/lib/formSchemas";
import { prisma } from "~/lib/prisma";
import type { Route } from "../+types/root";

export async function action(args: Route.ActionArgs) {
  await requireUser(args);
  try {
    const {
      data,
      errors,
      receivedValues: defaultValues,
    } = await getValidatedFormData<AnswerFormTypes>(
      args.request,
      answerSchemaResolver,
    );

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
      ok: true,
    };
  } catch (error) {
    console.error("error: ", error);
    return apiError(error);
  }
}
