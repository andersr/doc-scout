import { MessageType } from "@prisma/client";
import { answerQuery } from "@services/agents/docQuery/answerQuery";
import type { LoaderFunctionArgs } from "react-router";
import { data, useLoaderData } from "react-router";
import { twMerge } from "tailwind-merge";
import { ENV } from "~/.server/ENV";
import { requireSourceAndSourceChat } from "~/.server/models/sources/requireSourceAndSourceChat";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { generateId } from "~/.server/utils/generateId";
import getFormData from "~/.server/utils/getFormData";
import { serverError } from "~/.server/utils/serverError";
import BotChat from "~/components/chat/BotChat";
import { PageHeading } from "~/components/layout/PageHeading";
import { Icon } from "~/components/ui/Icon";
import { getNameSpace } from "~/config/namespaces";
import { prisma } from "~/lib/prisma";
import { userMessageSchema } from "~/lib/schemas/userMessage";
import type { ClientMessage } from "~/types/message";
import { type ServerResponse } from "~/types/server";
import { setSourceTitle } from "~/utils/setSourceTitle";
import type { Route } from "./+types/_auth.docs.$id";

export async function loader({ params }: LoaderFunctionArgs) {
  const { source, sourceChat } = await requireSourceAndSourceChat({ params });

  const chatMessages = sourceChat.messages;

  const messages: ClientMessage[] = chatMessages.map((m) => ({
    ...m,
    isBot: m.type === MessageType.BOT,
  }));

  return {
    cdn: ENV.AWS_CDN,
    messages,
    source,
    title: setSourceTitle(source),
  };
}

export default function DocDetailsLayout() {
  const { cdn, messages, source, title } = useLoaderData<typeof loader>();

  return (
    <div className="relative flex w-full flex-1 flex-col gap-6">
      <PageHeading
        pageTitle={title}
        headingContent={
          source.storagePath && (
            <a
              href={`${cdn}/${source.storagePath}`}
              target="_blank"
              rel="noreferrer"
              className={twMerge(
                "inline-flex items-center gap-1",
                "text-blue-600",
              )}
            >
              <span className="underline">View Doc</span>{" "}
              <Icon
                name="NEW_WINDOW"
                fontSize="20px"
                customStyles="no-underline"
              />
            </a>
          )
        }
      />
      <BotChat messages={messages} />
    </div>
  );
}

export async function action({ params, request }: Route.ActionArgs) {
  const { internalUser } = await requireUser({ request });
  try {
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
      namespace: getNameSpace("user", internalUser.publicId),
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

    return data({
      errors: null,
      ok: true,
    } satisfies ServerResponse);
  } catch (error) {
    return serverError(error);
  }
}
