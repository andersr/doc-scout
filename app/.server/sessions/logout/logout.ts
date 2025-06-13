import { redirect } from "react-router";
import { authSessionStore } from "~/.server/services/sessions/authSessionStore";
import { appRoutes } from "~/shared/appRoutes";
import { getSession } from "../getSession";

export async function logout({ request }: { request: Request }) {
  const session = await getSession({
    request,
  });
  return redirect(appRoutes("/login", { error: "true" }), {
    headers: {
      "Set-Cookie": await authSessionStore.destroySession(session),
    },
  });
}
