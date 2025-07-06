import { type ActionFunction } from "react-router";
import { logout } from "~/.server/services/sessions/logout/logout";
import { KEYS } from "~/shared/keys";

export async function loader() {
  return null;
}

export const action: ActionFunction = async ({ request }) => {
  const params = new URL(request.url).searchParams;
  const error = params.get(KEYS.error);
  return await logout({ error: !!error, request });
};
