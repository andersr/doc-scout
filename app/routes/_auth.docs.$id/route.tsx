import { MessageType } from "@prisma/client";
import type { ServerResponse } from "http";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { twMerge } from "tailwind-merge";
import { ENV } from "~/.server/ENV";
import { requireSourceAndSourceChat } from "~/.server/models/sources/requireSourceAndSourceChat";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { handleActionIntent } from "~/.server/utils/handleActionIntent";
import BotChat from "~/components/chat/BotChat";
import { PageHeading } from "~/components/layout/PageHeading";
import { IconButton } from "~/components/ui/buttons/IconButton";
import { Icon } from "~/components/ui/Icon";
import { DELETE_DOC_CONFIRM } from "~/config/confirmations";
import { KEYS } from "~/shared/keys";
import type { ClientMessage } from "~/types/message";
import { setSourceTitle } from "~/utils/setSourceTitle";
import { chatAction } from "./actions/chatAction";
import { deleteAction } from "./actions/deleteAction";

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

  const deleteFetcher = useFetcher<ServerResponse>();

  return (
    <div className="relative flex w-full flex-1 flex-col gap-6">
      <PageHeading
        pageTitle={title}
        headingContent={
          <ul className="flex items-center gap-4">
            {source.storagePath && (
              <li>
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
              </li>
            )}
            <li>
              <IconButton
                name="DELETE"
                label="Delete Doc"
                customStyles="text-danger/40 hover:text-danger"
                onClick={() => {
                  if (
                    confirm(
                      `${DELETE_DOC_CONFIRM}${messages.length > 0 ? " ***This will also delete all associated chat messages.***" : ""}`,
                    )
                  ) {
                    deleteFetcher.submit(
                      { intent: KEYS.delete },
                      { method: "POST" },
                    );
                  }
                }}
              />
            </li>
          </ul>
        }
      />
      <BotChat messages={messages} />
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  await requireUser(args);
  return await handleActionIntent({
    handlers: {
      chat: chatAction,
      delete: deleteAction,
    },
    ...args,
  });
}
