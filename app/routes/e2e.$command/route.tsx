import type { ActionFunctionArgs } from "react-router";
import { handleTestActionIntent } from "~/routes/e2e.$command/utils/handleTestActionIntent";
import { addDocs } from "./actions/addDocs";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  return await handleTestActionIntent({
    handlers: {
      addDocs,
    },
    params,
    request,
  });
};
