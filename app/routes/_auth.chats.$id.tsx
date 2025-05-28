import { MessageType } from "@prisma/client";
import { useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { redirect, useFetcher, useLoaderData } from "react-router";
import {
  createFormData,
  getValidatedFormData,
  useRemixForm,
} from "remix-hook-form";
import { serverError } from "~/.server/api/serverError";
import { requireInternalUser } from "~/.server/sessions/requireInternalUser";
import { generateId } from "~/.server/utils/generateId";
import { requireRouteParam } from "~/.server/utils/requireRouteParam";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { getNameSpace } from "~/config/namespaces";
import { prisma } from "~/lib/prisma";
import type { BotReply } from "~/lib/schemas/botReply";
import { type NewQuery, newQuerySchema } from "~/lib/schemas/newQuery";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.chats.$id";

export const handle: RouteData = {
  pageTitle: "Chat Details",
};

export function meta({ data }: { data: { collection: { name: string } } }) {
  return [
    { title: `Collection: ${data?.collection?.name || "Not Found"}` },
    // { content: "Collection details", name: "description" },
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  const publicId = requireRouteParam({
    key: KEYS.id,
    params: args.params,
  });

  const chat = await prisma.chat.findUnique({
    include: {
      messages: {
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

  const sources = chat.sources.map((s) => s.source).filter((s) => s !== null);

  const messages = chat.messages;

  const mostRecentMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;

  return {
    chat,
    messages,
    namespace,
    pendingQuery:
      mostRecentMessage?.type === MessageType.USER ? mostRecentMessage : null,
    sources,
  };
}

export default function ChatDetails() {
  const { chat, messages, namespace, pendingQuery, sources } =
    useLoaderData<typeof loader>();

  const queryFetcher = useFetcher();
  const responseFetcher = useFetcher();

  useEffect(() => {
    if (pendingQuery && responseFetcher.state === "idle") {
      const formData = createFormData<BotReply>({
        chatPublicId: chat.publicId,
        namespace,
        query: pendingQuery.text,
      });

      responseFetcher.submit(formData, {
        action: appRoutes("/api/messages/generated"),
        method: "POST",
      });
    }
  }, [chat.publicId, namespace, pendingQuery, responseFetcher]);

  const {
    formState: { errors, isSubmitSuccessful, isValid },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useRemixForm<NewQuery>({
    fetcher: queryFetcher,
    mode: "onSubmit",
    resolver: newQuerySchema.resolver,
    stringifyAllValues: false,
  });

  useEffect(() => {
    reset({ message: "" });
  }, [reset, isSubmitSuccessful]);

  useEffect(() => {
    setValue(
      "sources",
      sources.map((s) => s.publicId),
    );
  }, [setValue, sources]);

  const optimisticQuery = queryFetcher.formData
    ? queryFetcher.formData.get(KEYS.message)
    : null;

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageTitle>
          Chat with{" "}
          {sources.length > 0 ? (sources[0].name ?? sources[0].fileName) : ""}
        </PageTitle>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex-1">
          <div className="my-2">
            <h2>Messages</h2>
            <ul>
              {messages.map((m) => (
                <li key={m.id.toString()}>{m.text}</li>
              ))}
              {optimisticQuery && <li>{optimisticQuery.toString()}</li>}
              {responseFetcher.state !== "idle" && <li>BOT message Loading</li>}
            </ul>
          </div>
        </div>
        <queryFetcher.Form method="POST" onSubmit={handleSubmit}>
          <div className="mb-2">
            <Label className="pb-2">Message</Label>
            <textarea
              {...register("message")}
              rows={3}
              className="w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            ></textarea>
            {errors.message && <p>{errors.message.message}</p>}
          </div>
          <div className="py-4"></div>
          <Button type="submit" disabled={!isValid}>
            {queryFetcher.state !== "idle" ? "Submitting..." : "Submit"}
          </Button>
          <p className="">
            Display checkbox list if two or more sources added.
          </p>
        </queryFetcher.Form>
      </div>
    </div>
  );
}

export async function action(args: Route.ActionArgs) {
  const currentUser = await requireInternalUser(args);
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

    // TODO: update chat updatedAt
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
    return serverError(error);
  }
}
