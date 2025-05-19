import { MessageType } from "@prisma/client";
import { useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import {
  createFormData,
  getValidatedFormData,
  useRemixForm,
} from "remix-hook-form";
import { apiError } from "~/.server/api/apiError";
import { requireUser } from "~/.server/users";
import { generateId } from "~/.server/utils/generateId";
import { requireParam } from "~/.server/utils/requireParam";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { prisma } from "~/lib/prisma";
import { type BotReply } from "~/lib/schemas/botReply";
import {
  type UserMessage,
  userMessageResolver,
} from "~/lib/schemas/userMessage";
import { appRoutes } from "~/shared/appRoutes";
import { PARAMS } from "~/shared/params";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.collections.$id.chat";

export const handle: RouteData = {
  pageTitle: "Collection Chat",
};

export function meta({ data }: { data: { collection: { name: string } } }) {
  return [
    { title: `Chat: ${data?.collection?.name || "Not Found"}` },
    { content: "Chat with a collection", name: "description" },
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  const collectionId = requireParam({
    key: PARAMS.ID,
    params: args.params,
  });

  const collection = await prisma.collection.findUniqueOrThrow({
    include: {
      chat: {
        include: {
          messages: true,
        },
      },
      sources: true,
    },
    where: {
      publicId: collectionId,
    },
  });
  const chat = collection.chat;

  if (!chat) {
    throw new Error("No collection chat found");
  }

  const messages = collection.chat?.messages;

  const mostRecentMessage =
    messages && messages.length > 0 ? messages[messages.length - 1] : null;

  return {
    chat,
    collection,
    pendingQueryMessage:
      mostRecentMessage?.type === MessageType.USER ? mostRecentMessage : null,
  };
}

export default function CollectionChatRoute() {
  const { chat, collection, pendingQueryMessage } =
    useLoaderData<typeof loader>();

  const queryFetcher = useFetcher();
  const answerFetcher = useFetcher();

  const {
    formState: { errors, isSubmitSuccessful, isValid },
    handleSubmit,
    register,
    reset,
  } = useRemixForm<UserMessage>({
    fetcher: queryFetcher,
    mode: "onSubmit",
    resolver: userMessageResolver,
    stringifyAllValues: false,
  });

  useEffect(() => {
    if (pendingQueryMessage && answerFetcher.state === "idle") {
      const formData = createFormData<BotReply>({
        chatPublicId: chat.publicId,
        namespace: collection.publicId,
        query: pendingQueryMessage.text,
      });

      answerFetcher.submit(formData, {
        action: appRoutes("/messages/generated"),
        method: "POST",
      });
    }
  }, [answerFetcher, pendingQueryMessage, collection, chat.publicId]);

  const optimisticMessage = queryFetcher.formData
    ? queryFetcher.formData.get(PARAMS.MESSAGE)
    : null;

  useEffect(() => {
    reset({ message: "" });
  }, [isSubmitSuccessful, reset]);

  return (
    <div>
      <div className="my-2">
        <h2>Messages</h2>
        <ul>
          {chat.messages.map((m) => (
            <li key={m.id.toString()}>{m.text}</li>
          ))}
          {optimisticMessage && <li>{optimisticMessage.toString()}</li>}
          {answerFetcher.state !== "idle" && <li>BOT message Loading</li>}
        </ul>
      </div>
      <queryFetcher.Form method="POST" onSubmit={handleSubmit}>
        <div className="mb-2">
          <Label className="pb-2">Message</Label>
          <textarea
            {...register("message")}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          ></textarea>
          {errors.message && <p>{errors.message.message}</p>}
        </div>
        {/* <div className="py-4">
          <h2>Collection: {collection.name}</h2>
        </div> */}
        <Button type="submit" disabled={!isValid}>
          {queryFetcher.state !== "idle" ? "Submitting..." : "Submit"}
        </Button>
      </queryFetcher.Form>
    </div>
  );
}

export async function action(args: Route.ActionArgs) {
  const currentUser = await requireUser(args);
  try {
    const collectionId = requireParam({
      key: PARAMS.ID,
      params: args.params,
    });

    const collection = await prisma.collection.findUniqueOrThrow({
      include: {
        chat: true,
      },
      where: {
        publicId: collectionId,
      },
    });

    const chat = collection.chat;

    if (!chat) {
      throw new Error("No collection chat found");
    }

    const {
      data,
      errors,
      receivedValues: defaultValues,
    } = await getValidatedFormData<UserMessage>(
      args.request,
      userMessageResolver,
    );

    if (errors) {
      return { defaultValues, errors, ok: false };
    }

    await prisma.message.create({
      data: {
        authorId: currentUser.id,
        chatId: chat.id,
        createdAt: new Date(),
        publicId: generateId(),
        text: data.message,
      },
    });

    return {
      ok: true,
    };
  } catch (error) {
    console.error("new chat message error: ", error);
    return apiError(error);
  }
}
