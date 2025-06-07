import { MessageType } from "@prisma/client";
import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, useFetcher, useLoaderData } from "react-router";
import {
  createFormData,
  getValidatedFormData,
  useRemixForm,
} from "remix-hook-form";
import { twMerge } from "tailwind-merge";
import { requireUser } from "~/.server/sessions/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { requireRouteParam } from "~/.server/utils/requireRouteParam";
import { serverError } from "~/.server/utils/serverError";
import { ChatListItem } from "~/components/ChatListItem";
import { ListContainer } from "~/components/containers/ListContainer";
import { ScrollContainer } from "~/components/containers/ScrollContainer";
import { Icon } from "~/components/icon";
import { PageTitle } from "~/components/page-title";
import { Spinner } from "~/components/Spinner";
import { getNameSpace } from "~/config/namespaces";
import { FALLBACK_TITLE } from "~/config/sources";
import { useScrollIntoView } from "~/hooks/useScrollIntoView";
import { prisma } from "~/lib/prisma";
import type { BotReply } from "~/lib/schemas/botReply";
import { type NewQuery, newQuerySchema } from "~/lib/schemas/newQuery";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { HOVER_TRANSITION } from "~/styles/animations";
import { INPUT_STYLES } from "~/styles/inputs";
import { type ClientMessage, MESSAGE_INCLUDE } from "~/types/message";
import type { ServerResponse } from "~/types/server";
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

  const mostRecentMessage =
    chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;

  const messages: ClientMessage[] = chatMessages.map((m) => ({
    ...m,
    isBot: m.type === MessageType.BOT,
  }));

  return {
    chat,
    messages,
    namespace,
    newBotMessage: mostRecentMessage?.type === MessageType.BOT,
    pendingQuery:
      mostRecentMessage?.type === MessageType.USER ? mostRecentMessage : null,
    title: `Chat with "${title}"`,
  };
}

export default function ChatDetails() {
  const { chat, messages, namespace, newBotMessage, pendingQuery, title } =
    useLoaderData<typeof loader>();

  const queryFetcher = useFetcher();
  const responseFetcher = useFetcher<ServerResponse>();
  // const { handleResizeTextArea } = useTextArea(KEYS.message);

  const hasPendingQuery =
    responseFetcher.data?.errors === null &&
    responseFetcher.state !== "idle" &&
    !!pendingQuery;

  const botResponded =
    responseFetcher.data?.errors === null &&
    responseFetcher.state === "idle" &&
    newBotMessage;

  const listBottomRef = useScrollIntoView({
    onAnyTrue: [hasPendingQuery, botResponded],
    onLoad: true,
  });

  useEffect(() => {
    if (
      !responseFetcher.data?.errors &&
      pendingQuery &&
      responseFetcher.state === "idle"
    ) {
      const formData = createFormData<BotReply>({
        chatPublicId: chat.publicId,
        namespace,
        query: pendingQuery.text,
      });

      responseFetcher.submit(formData, {
        action: appRoutes("/api/messages/generated"),
        method: "POST",
      });
      listBottomRef.current?.scrollIntoView(false);
    }
  }, [chat.publicId, listBottomRef, namespace, pendingQuery, responseFetcher]);

  const methods = useRemixForm<NewQuery>({
    fetcher: queryFetcher,
    mode: "onSubmit",
    resolver: newQuerySchema.resolver,
    stringifyAllValues: false,
  });

  const {
    formState: { errors, isSubmitSuccessful, isValid },
    handleSubmit,
    register,
    reset,
  } = methods;

  useEffect(() => {
    reset({ message: "" });
  }, [reset, isSubmitSuccessful]);

  const optimisticQuery = queryFetcher.formData
    ? queryFetcher.formData.get(KEYS.message)
    : null;

  return (
    <div className="relative flex w-full flex-1 flex-col gap-6">
      <title>{title}</title>
      <div className="flex items-center justify-between">
        <PageTitle title={title} />
      </div>
      <div className="flex flex-1 flex-col">
        <ScrollContainer
          listBottomRef={listBottomRef}
          height="h-[calc(100vh-300px)]"
          marginBottom="mb-12"
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
            {optimisticQuery && (
              <ChatListItem
                createdAt={new Date()}
                text={optimisticQuery.toString()}
                authorName={AUTHOR_NAME_PLACEHOLDER}
              />
            )}
            {responseFetcher.state !== "idle" && <ChatListItem isBot loading />}
          </ListContainer>
        </ScrollContainer>
        <div
          className={twMerge(
            "fixed bottom-0 z-10 h-24 p-2 md:w-5xl",
            "bg-background",
          )}
        >
          <queryFetcher.Form method="POST" onSubmit={handleSubmit}>
            <div className="flex w-full items-end gap-2 md:gap-4">
              <textarea
                {...register("message")}
                className={twMerge(INPUT_STYLES, "bg-white")}
                placeholder={"Message"}
                rows={1}
              />
              <div className="flex items-center py-1 md:py-0">
                <button
                  type="submit"
                  className={twMerge(
                    "disabled:bg-grey-2 hover:text-light-green bg-navy-blue flex cursor-pointer items-center justify-center rounded-full p-1 text-white disabled:text-stone-100 md:rounded-lg md:p-3",
                    HOVER_TRANSITION,
                  )}
                  disabled={!isValid}
                >
                  {queryFetcher.state !== "idle" ? (
                    <Spinner />
                  ) : (
                    <Icon name={"ARROW_UP"} fontSize="24px" />
                  )}
                </button>
              </div>
            </div>
            {errors.message && <p>{errors.message.message}</p>}
          </queryFetcher.Form>
        </div>
      </div>
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  const { internalUser } = await requireUser(args);
  try {
    const chatPublicId = requireRouteParam({
      key: KEYS.id,
      params: args.params,
    });

    const chat = await prisma.chat.findFirstOrThrow({
      where: {
        publicId: chatPublicId,
      },
    });

    const {
      data,
      errors,
      receivedValues: defaultValues,
    } = await getValidatedFormData<NewQuery>(
      args.request,
      newQuerySchema.resolver,
    );

    if (errors) {
      return { defaultValues, errors, ok: false };
    }

    await prisma.message.create({
      data: {
        authorId: internalUser.id,
        chatId: chat.id,
        createdAt: new Date(),
        publicId: generateId(),
        text: data.message,
      },
    });

    return {
      errors: null,
      ok: true,
    } satisfies ServerResponse;
  } catch (error) {
    console.error("new chat message error: ", error);
    return serverError(error);
  }
}
