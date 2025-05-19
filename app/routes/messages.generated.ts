import { MessageType } from "@prisma/client";
import { getValidatedFormData } from "remix-hook-form";
import { apiError } from "~/.server/api/apiError";
import { generateGraph } from "~/.server/langchain/generateGraph";
import { requireUser } from "~/.server/users/requireUser";
import { answerSchemaResolver, type AnswerFormTypes } from "~/lib/formSchemas";
import { prisma } from "~/lib/prisma";
import type { Route } from "../+types/root";

export async function action(args: Route.ActionArgs) {
  await requireUser(args);
  try {
    const {
      errors,
      data,
      receivedValues: defaultValues,
    } = await getValidatedFormData<AnswerFormTypes>(
      args.request,
      answerSchemaResolver,
    );

    if (errors) {
      return { errors, defaultValues, ok: false };
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
        text: result.answer,
        createdAt: new Date(),
        type: MessageType.BOT,
        chatId: chat.id,
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
