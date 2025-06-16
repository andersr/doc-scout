import { redirect } from "react-router";
import { authSessionStore } from "~/.server/services/sessions/authSessionStore";
import { getSession } from "~/.server/services/sessions/getSession";
import { appRoutes } from "~/shared/appRoutes";

export async function logout({ request }: { request: Request }) {
  const session = await getSession({
    request,
  });
  return redirect(appRoutes("/login"), {
    headers: {
      "Set-Cookie": await authSessionStore.destroySession(session),
    },
  });
}
