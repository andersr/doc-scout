import { MessageType } from "@prisma/client";
import { createCloudfrontSignedUrl } from "@services/cloudStore/createCloudfrontSignedUrl";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { requireSourceAndSourceChat } from "~/.server/models/sources/requireSourceAndSourceChat";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { handleActionIntent } from "~/.server/utils/handleActionIntent";
import BotChat from "~/components/chat/BotChat";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import type { MenuActionInput } from "~/types/menu";
import type { ClientMessage } from "~/types/message";
import type { RouteData } from "~/types/routes";
import { setSourceTitle } from "~/utils/setSourceTitle";
import { chatAction } from "./actions/chatAction";
import { deleteAction } from "./actions/deleteAction";

export const handle: RouteData = {
  addBackButton: true,
  noFooter: true,
  whiteBackground: true,
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { source, sourceChat } = await requireSourceAndSourceChat({ params });

  const chatMessages = sourceChat.messages;

  const messages: ClientMessage[] = chatMessages.map((m) => ({
    ...m,
    isBot: m.type === MessageType.BOT,
  }));
  const docUrl = source.storagePath
    ? await createCloudfrontSignedUrl({ storagePath: source.storagePath })
    : "";

  const pageTitle = setSourceTitle(source);
  return {
    actionsInput: [
      {
        link: {
          label: "View Doc",
          to: docUrl,
        },
      },
      {
        button: {
          action: appRoutes("/docs/:id", {
            id: source.publicId,
          }),
          confirmMessage: `Delete "${pageTitle}"?${messages.length > 0 ? " ****This will also delete any associated chat messages.****" : ""}`,
          danger: true,
          intent: KEYS.delete,
          label: "Delete",
          method: "DELETE",
        },
      },
    ] satisfies MenuActionInput[],
    docUrl, // used in _main - maybe no longer needed
    messages,
    pageTitle,
    source,
  };
}

export default function DocDetailsLayout() {
  const { messages } = useLoaderData<typeof loader>();

  return <BotChat messages={messages} />;
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
