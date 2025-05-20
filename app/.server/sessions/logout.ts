import { redirect } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import { authSessionStore } from "./authSessionStore";
import { getSessionCookie } from "./getSessionCookie";

export async function logout({ request }: { request: Request }) {
  const cookie = await getSessionCookie({
    request,
  });
  console.info("LOGOUT cookie: ", cookie);
  throw redirect(appRoutes("/login"), {
    headers: {
      "Set-Cookie": await authSessionStore.destroySession(cookie),
    },
  });
}
