import { redirect } from "react-router";
import { authSessionStore } from "~/.server/services/sessions/authSessionStore";
import { getSession } from "~/.server/services/sessions/getSession";
import { appRoutes } from "~/shared/appRoutes";

export async function logout({
  error,
  request,
}: {
  error?: boolean;
  request: Request;
}) {
  const session = await getSession({
    request,
  });
  return redirect(appRoutes("/", error ? { error: "true" } : undefined), {
    headers: {
      "Set-Cookie": await authSessionStore.destroySession(session),
    },
  });
}
