import { zodResolver } from "@hookform/resolvers/zod";
// import { DevTool } from "@hookform/devtools";
import { MessageType } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { useEffect } from "react";
import { useLoaderData } from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { apiError } from "~/.server/api/apiError";
import { generateGraph } from "~/.server/langchain/generateGraph";
import { requireUser } from "~/.server/users";
import { requireParam } from "~/.server/utils/requireParam";
import { Button } from "~/components/ui/button";
import { useFetcherWithReset } from "~/hooks/useFetcherWithReset";
import { collectionChatSchema } from "~/lib/formSchemas";
import { prisma } from "~/lib/prisma";
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
  const { id } = params;
  console.info("id: ", id);

  const chat = await prisma.chat.findUniqueOrThrow({
    where: {
      publicId: id,
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

  if (messages.length < 2) {
    return {
      chat,
      messages,
      collection,
      newMessages: [],
    };
  }

  const newMessages = messages.splice(messages.length - 2);

  return {
    chat,
    messages,
    collection,
    newMessages,
  };
}

export default function InquiryChat() {
  const { messages, newMessages, collection } = useLoaderData<typeof loader>();

  const fetcher = useFetcherWithReset();

  const {
    handleSubmit,
    formState: { errors, isValid, isSubmitSuccessful },
    register,
    // control,
    reset,
    setValue,
  } = useRemixForm<FormData>({
    mode: "onSubmit",
    resolver,
    stringifyAllValues: false,
    fetcher,
    submitData: {
      collectionId: collection.publicId,
    },
  });

  const optimisticMessage = fetcher.formData
    ? fetcher.formData.get(PARAMS.MESSAGE)
    : null;

  const isLoading = fetcher.state !== "idle";

  useEffect(() => {
    reset({ message: "" });
    setValue("collectionId", collection.publicId);
    setValue(
      "sourceIds",
      collection.sources.map((s) => s.publicId),
    );
  }, [isSubmitSuccessful, reset]);

  useEffect(() => {
    setValue("collectionId", collection.publicId);
    setValue(
      "sourceIds",
      collection.sources.map((s) => s.publicId),
    );
  }, []);

  return (
    <div>
      <div className="my-2">
        <h2>Messages</h2>
        <ul>
          {messages.map((m) => (
            <li key={m.id.toString()}>{m.text}</li>
          ))}
          {optimisticMessage ? (
            <li>{optimisticMessage.toString()}</li>
          ) : newMessages[0] ? (
            <li>{newMessages[0].text}</li>
          ) : null}
          {isLoading ? (
            <li>BOT message Loading</li>
          ) : newMessages[1] ? (
            <li>{newMessages[1].text}</li>
          ) : null}
        </ul>
      </div>
      <fetcher.Form method="POST" onSubmit={handleSubmit}>
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
          <h2>Sources</h2>
          <ul>
            {collection.sources.map((s) => (
              <li key={s.publicId}>
                <label className="cursor-pointer">
                  <input
                    {...register("sourceIds")}
                    type="checkbox"
                    defaultChecked
                    className="mr-3 cursor-pointer disabled:opacity-70"
                    value={s.publicId}
                  />
                  {s.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <Button type="submit" disabled={!isValid}>
          {fetcher.state !== "idle" ? "Submitting..." : "Submit"}
        </Button>
      </fetcher.Form>
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

    const userMessageCreatedAt = new Date();

    const graph = await generateGraph({
      namespace: data.collectionId,
      sources: Array.isArray(data.sourceIds)
        ? data.sourceIds
        : [data.sourceIds],
    });

    const inputs = {
      question: data.message,
    };

    const result = await graph.invoke(inputs);

    await prisma.message.createMany({
      data: [
        {
          text: data.message,
          createdAt: userMessageCreatedAt,
          chatId: chat.id,
          authorId: currentUser.id,
        },
        {
          text: result.answer,
          createdAt: new Date(),
          type: MessageType.BOT,
          chatId: chat.id,
        },
      ],
    });

    return {
      ok: true,
    };
  } catch (error) {
    console.error("new chat message error: ", error);
    return apiError(error);
  }
}
