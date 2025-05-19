import { zodResolver } from "@hookform/resolvers/zod";
// import { DevTool } from "@hookform/devtools";
import { MessageType } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { useEffect } from "react";
import { useLoaderData } from "react-router";
import {
  createFormData,
  getValidatedFormData,
  useRemixForm,
} from "remix-hook-form";
import { z } from "zod";
import { apiError } from "~/.server/api/apiError";
import { requireUser } from "~/.server/users";
import { requireParam } from "~/.server/utils/requireParam";
import { Button } from "~/components/ui/button";
import { useFetcherWithReset } from "~/hooks/useFetcherWithReset";
import { collectionChatSchema, type AnswerFormTypes } from "~/lib/formSchemas";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { PARAMS } from "~/shared/params";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.queries.$id";

const PAGE_TITLE = "Query";
export const handle: RouteData = {
  pageTitle: PAGE_TITLE,
};

export function meta() {
  return [
    { title: PAGE_TITLE },
    { name: "description", content: "Query chat interface" },
  ];
}

type FormData = z.infer<typeof collectionChatSchema>;
const resolver = zodResolver(collectionChatSchema);

export async function loader({ params }: { params: { id: string } }) {
  const chatPublicId = requireParam({ params, key: PARAMS.ID });

  const chat = await prisma.chat.findUniqueOrThrow({
    where: {
      publicId: chatPublicId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
      chatCollections: {
        include: {
          collection: {
            include: {
              sources: true,
            },
          },
        },
      },
    },
  });

  const collections = chat.chatCollections
    .map((c) => c.collection)
    .filter((c) => c !== null);
  const collection = collections[0];

  if (!collection) {
    throw new Error("no collection");
  }
  const messages = chat.messages;

  const mostRecentMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  return {
    chat,
    messages,
    collection,
    pendingQueryMessage:
      mostRecentMessage?.type === MessageType.USER ? mostRecentMessage : null,
  };
}

// TODO: add property sort linting

export default function InquiryChat() {
  const { messages, collection, chat, pendingQueryMessage } =
    useLoaderData<typeof loader>();

  const queryFetcher = useFetcherWithReset();
  const answerFetcher = useFetcherWithReset();

  const {
    handleSubmit,
    formState: { errors, isValid, isSubmitSuccessful },
    register,
    reset,
  } = useRemixForm<FormData>({
    mode: "onSubmit",
    resolver,
    stringifyAllValues: false,
    fetcher: queryFetcher,
  });

  useEffect(() => {
    if (pendingQueryMessage && answerFetcher.state === "idle") {
      const formData = createFormData<AnswerFormTypes>({
        query: pendingQueryMessage.text,
        namespace: collection.publicId,
        chatPublicId: chat.publicId,
      });

      answerFetcher.submit(formData, {
        method: "POST",
        action: appRoutes("/api/internal/messages/generated"),
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
          {messages.map((m) => (
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
        <div className="py-4">
          <h2>Collection: {collection.name}</h2>
        </div>
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
    const chatPublicId = requireParam({ params: args.params, key: PARAMS.ID });

    const chat = await prisma.chat.findFirstOrThrow({
      where: {
        publicId: chatPublicId,
      },
    });

    const {
      errors,
      data,
      receivedValues: defaultValues,
    } = await getValidatedFormData<FormData>(args.request, resolver);

    if (errors) {
      return { errors, defaultValues, ok: false };
    }

    await prisma.message.create({
      data: {
        text: data.message,
        createdAt: new Date(),
        chatId: chat.id,
        authorId: currentUser.id,
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
