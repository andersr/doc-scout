import { redirect } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import { authSessionStore } from "./authSessionStore";
import { getSessionCookie } from "./getSessionCookie";

export async function destroySession({ request }: { request: Request }) {
  const cookie = await getSessionCookie({
    request,
  });
  return redirect(appRoutes("/login"), {
    headers: {
      "Set-Cookie": await authSessionStore.destroySession(cookie),
    },
  });
}
