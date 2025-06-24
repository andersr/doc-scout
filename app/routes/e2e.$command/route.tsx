import type { ActionFunctionArgs } from "react-router";
import { handleTestActionIntent } from "~/routes/e2e.$command/utils/handleTestActionIntent";
import { createChatAction } from "./actions/createChatAction";
// import { deleteChatAction } from "./actions/deleteChatAction";
import { deleteMessagesAction } from "./actions/deleteMessagesAction";
import { upsertDoc } from "./actions/upsertDoc";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  return await handleTestActionIntent({
    handlers: {
      createChat: createChatAction,
      // deleteChat: deleteChatAction,
      deleteMessages: deleteMessagesAction,
      upsertDoc,
    },
    params,
    request,
  });
};
