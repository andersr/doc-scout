import { type ActionFunction } from "react-router";
import { logout } from "~/.server/sessions/logout/logout";

export const action: ActionFunction = async ({ request }) => {
  return await logout({ request });
};
