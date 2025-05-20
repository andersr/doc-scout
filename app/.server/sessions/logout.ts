import { redirect } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import { authSessionStore } from "./authSessionStore";
import { getSession } from "./getSession";

export async function logout({ request }: { request: Request }) {
  const session = await getSession({
    request,
  });
  throw redirect(appRoutes("/login"), {
    headers: {
      "Set-Cookie": await authSessionStore.destroySession(session),
    },
  });
}
