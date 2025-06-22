import type { ActionFunctionArgs } from "react-router";
import { handleTestActionIntent } from "~/routes/e2e.$command/utils/handleTestActionIntent";
import { createChatAction } from "./actions/createChatAction";
import { deleteChatAction } from "./actions/deleteChatAction";
import { upsertDoc } from "./actions/upsertDoc";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  return await handleTestActionIntent({
    handlers: {
      createChat: createChatAction,
      deleteChat: deleteChatAction,
      upsertDoc,
    },
    params,
    request,
  });
};
