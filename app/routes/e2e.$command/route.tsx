import type { ActionFunctionArgs } from "react-router";
import { handleTestActionIntent } from "~/routes/e2e.$command/utils/handleTestActionIntent";
import { deleteMessagesAction } from "./actions/deleteMessagesAction";
import { deleteSourceAction } from "./actions/deleteSourceAction";
import { deleteSourcesByNameAction } from "./actions/deleteSourcesByNameAction";
import { upsertDoc } from "./actions/upsertDoc";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  return await handleTestActionIntent({
    handlers: {
      deleteMessages: deleteMessagesAction,
      deleteSource: deleteSourceAction,
      deleteSourcesByName: deleteSourcesByNameAction,
      upsertDoc,
    },
    params,
    request,
  });
};
