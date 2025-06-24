import { MessageType } from "@prisma/client";
import { answerQuery } from "@services/agents/docQuery/answerQuery";
import type { LoaderFunctionArgs } from "react-router";
import { data, useLoaderData } from "react-router";
import { ENV } from "~/.server/ENV";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { requireRouteParam } from "~/.server/utils/requireRouteParam";
import { requireSourceChat } from "~/.server/utils/requireSourceChat";
import { serverError } from "~/.server/utils/serverError";
import BotChat from "~/components/chat/BotChat";
import { Icon } from "~/components/icon";
import { PageHeading } from "~/components/ui/PageHeading";
import { getNameSpace } from "~/config/namespaces";
import { prisma } from "~/lib/prisma";
import { userMessageSchema } from "~/lib/schemas/userMessage";
import { KEYS } from "~/shared/keys";
import type { ClientMessage } from "~/types/message";
import { ServerError, type ServerResponse } from "~/types/server";
import { SOURCE_INCLUDE } from "~/types/source";
import { setSourceTitle } from "~/utils/setSourceTitle";
import type { Route } from "./+types/_auth.docs.$id";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { clientUser } = await requireUser({ request });
  const sourcePublicId = requireRouteParam({
    key: KEYS.id,
    params,
  });

  // TODO: add error boundary to handle thrown errors
  const source = await prisma.source.findFirstOrThrow({
    include: SOURCE_INCLUDE,
    where: {
      publicId: sourcePublicId,
    },
  });

  // turn into requireSourceChat util
  // const sourceChat = source.chats.length > 0 ? source.chats[0].chat : undefined;

  // if (!sourceChat) {
  //   throw new ServerError("No source chat found.");
  // }

  const sourceChat = requireSourceChat({ source });
  // TODO: move to separate function associated with BotChat component
  const chatMessages = sourceChat.messages;

  const messages: ClientMessage[] = chatMessages.map((m) => ({
    ...m,
    isBot: m.type === MessageType.BOT,
  }));

  const mostRecentMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  return {
    cdn: ENV.CDN_HOST,
    clientUser,
    hasPendingQuery: mostRecentMessage?.type === MessageType.USER,
    messages,
    mostRecentMessage,
    source,
    title: setSourceTitle(source),
  };
}

export default function DocDetailsLayout() {
  const { cdn, clientUser, hasPendingQuery, messages, source, title } =
    useLoaderData<typeof loader>();

  return (
    <div className="relative flex w-full flex-1 flex-col gap-6">
      <PageHeading pageTitle={title}></PageHeading>
      <div className="">
        {source.storagePath && (
          <a
            href={`${cdn}/${source.storagePath}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-blue-500"
          >
            <div className="underline">{source.fileName}</div>{" "}
            <Icon name="NEW_WINDOW" fontSize="20px" />
          </a>
        )}
      </div>
      <BotChat
        clientUser={clientUser}
        messages={messages}
        hasPendingQuery={hasPendingQuery}
      />
    </div>
  );
}

export async function action({ params, request }: Route.ActionArgs) {
  const { internalUser } = await requireUser({ request });
  try {
    // TODO: nearly identical to loader, wrapped in try/catch here
    const sourcePublicId = requireRouteParam({
      key: KEYS.id,
      params,
    });

    const source = await prisma.source.findFirstOrThrow({
      include: {
        chats: {
          include: {
            chat: {
              include: {
                messages: {
                  include: {
                    author: true,
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                },
              },
            },
          },
        },
      },
      where: {
        publicId: sourcePublicId,
      },
    });

    // TODO: assumes first chat is primary chat, add explicit ref to primary source chat, eg add primary boolean to ChatSource
    const sourceChat =
      source.chats.length > 0 ? source.chats[0].chat : undefined;

    if (!sourceChat) {
      throw new ServerError("No source chat found.");
    }

    const formData = Object.fromEntries(await request.formData());
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

    // TODO: be consistent: bot vs Agent
    // TOO: should namespace be specific to the source and not the user?
    const botAnswer = await answerQuery({
      namespace: getNameSpace("user", internalUser.publicId),
      query: input.message,
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
    console.error("new chat message error: ", error);
    return serverError(error);
  }
}
