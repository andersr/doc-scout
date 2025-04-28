import { type ActionFunction } from "react-router";
import { destroySession } from "~/.server/sessions/destroySession";

export const action: ActionFunction = async ({ request }) => {
  return await destroySession({ request });
};
