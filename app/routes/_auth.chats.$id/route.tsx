import { MessageType } from "@prisma/client";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, redirect, useFetcher, useLoaderData } from "react-router";
import { twMerge } from "tailwind-merge";

import { answerQuery } from "@services/agents/docQuery/answerQuery";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { requireRouteParam } from "~/.server/utils/requireRouteParam";
import { serverError } from "~/.server/utils/serverError";
import { ChatListItem } from "~/components/ChatListItem";
import { ListContainer } from "~/components/containers/ListContainer";
import { ScrollContainer } from "~/components/containers/ScrollContainer";
import { Icon } from "~/components/icon";
import { PageTitle } from "~/components/PageTitle";
import { Spinner } from "~/components/Spinner";
import { getNameSpace } from "~/config/namespaces";
import { FALLBACK_TITLE } from "~/config/sources";
import { useScrollIntoView } from "~/hooks/useScrollIntoView";
import { prisma } from "~/lib/prisma";
import { userMessageSchema } from "~/lib/schemas/userMessage";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { HOVER_TRANSITION } from "~/styles/animations";
import { INPUT_STYLES } from "~/styles/inputs";
import { type ClientMessage, MESSAGE_INCLUDE } from "~/types/message";
import { ServerError, type ServerResponse } from "~/types/server";
import { setSourceTitle } from "~/utils/setSourceTitle";

// temporary until user name is added
const AUTHOR_NAME_PLACEHOLDER = "AUTHOR NAME";

export async function loader(args: LoaderFunctionArgs) {
  const publicId = requireRouteParam({
    key: KEYS.id,
    params: args.params,
  });

  const chat = await prisma.chat.findUnique({
    include: {
      messages: {
        include: MESSAGE_INCLUDE,
        orderBy: {
          createdAt: "asc",
        },
      },
      owner: true,
      sources: {
        include: {
          source: true,
        },
      },
    },
    where: {
      publicId,
    },
  });

  if (!chat) {
    // add flash message
    throw redirect(appRoutes("/docs"));
  }

  const owner = chat.owner;

  if (!owner) {
    throw new Error("no chat owner found");
  }

  const namespace = getNameSpace("user", owner.publicId);

  // TODO: currently only chatting with a single source, only current purpose is to display a title
  const sources = chat.sources.map((s) => s.source).filter((s) => s !== null);

  const title =
    sources.length > 0 ? setSourceTitle(sources[0]) : FALLBACK_TITLE;

  const chatMessages = chat.messages;

  const messages: ClientMessage[] = chatMessages.map((m) => ({
    ...m,
    isBot: m.type === MessageType.BOT,
  }));

  const mostRecentMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  return {
    // chat,
    hasPendingQuery: mostRecentMessage?.type === MessageType.USER,
    messages,
    mostRecentMessage,
    // namespace,
    title: `Chat with "${title}"`,
  };
}

export default function ChatDetails() {
  const { hasPendingQuery, messages, title } = useLoaderData<typeof loader>();

  const [message, setMessage] = useState("");

  const userMessage = useFetcher();

  const botResponded = !hasPendingQuery && userMessage.state === "idle";

  const listBottomRef = useScrollIntoView({
    onAnyTrue: [hasPendingQuery, botResponded],
    onLoad: true,
  });

  const optimisticMessage = userMessage.formData
    ? userMessage.formData.get(KEYS.message)
    : null;

  const submitDisabled = userMessage.state !== "idle" || message.trim() === "";

  return (
    <div className="relative flex w-full flex-1 flex-col gap-6">
      <title>{title}</title>
      <div className="flex items-center justify-between">
        <PageTitle title={title} />
      </div>
      <div className="flex flex-1 flex-col">
        <ScrollContainer
          listBottomRef={listBottomRef}
          height="h-[calc(100vh-285px)]"
          marginBottom=""
        >
          <ListContainer>
            {messages.map((m) => (
              <ChatListItem
                key={m.publicId}
                isBot={m.isBot}
                createdAt={m.createdAt}
                text={m.text}
                authorName={AUTHOR_NAME_PLACEHOLDER}
              />
            ))}
            {optimisticMessage && (
              <ChatListItem
                createdAt={new Date()}
                text={optimisticMessage.toString()}
                authorName={AUTHOR_NAME_PLACEHOLDER}
              />
            )}
            {userMessage.state !== "idle" && <ChatListItem isBot loading />}
          </ListContainer>
        </ScrollContainer>
        <div
          className={twMerge(
            "fixed right-4 bottom-4 left-4 z-10 md:mx-auto md:max-w-5xl",
            "bg-background",
          )}
        >
          <userMessage.Form method="POST">
            <div className="flex w-full items-end gap-2">
              <input
                type="hidden"
                name={KEYS.intent}
                defaultValue={KEYS.message}
              />
              <textarea
                name={KEYS.message}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={twMerge(INPUT_STYLES, "bg-white")}
                placeholder={"Message"}
                rows={1}
              />
              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();

                    const formData = new FormData();
                    formData.append(KEYS.message, message);
                    userMessage.submit(formData, {
                      encType: "multipart/form-data",
                      method: "post",
                    });
                  }}
                  // type="submit"
                  className={twMerge(
                    "disabled:bg-grey-2 hover:text-light-green bg-navy-blue flex cursor-pointer items-center justify-center rounded-lg p-3 text-white disabled:text-stone-100 disabled:opacity-40",
                    HOVER_TRANSITION,
                  )}
                  disabled={submitDisabled}
                >
                  {userMessage.state !== "idle" ? (
                    <Spinner />
                  ) : (
                    <Icon name={"ARROW_UP"} fontSize="24px" />
                  )}
                </button>
              </div>
            </div>
            {/* {errors.message && <p>{errors.message.message}</p>} */}
          </userMessage.Form>
        </div>
      </div>
    </div>
  );
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { internalUser } = await requireUser({ request });
  try {
    const chatPublicId = requireRouteParam({
      key: KEYS.id,
      params,
    });

    const chat = await prisma.chat.findFirstOrThrow({
      include: {
        owner: true,
      },
      where: {
        publicId: chatPublicId,
      },
    });

    if (!chat.owner) {
      console.error("No chat owner");
      throw new ServerError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
    }

    const formData = Object.fromEntries(await request.formData());
    const input = userMessageSchema.parse(formData);

    await prisma.message.create({
      data: {
        authorId: internalUser.id,
        chatId: chat.id,
        createdAt: new Date(),
        publicId: generateId(),
        text: input.message,
      },
    });

    // TODO: be consistent: bot vs Agent
    const botAnswer = await answerQuery({
      namespace: getNameSpace("user", chat.owner.publicId),
      query: input.message,
    });

    await prisma.message.create({
      data: {
        chatId: chat.id,
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
