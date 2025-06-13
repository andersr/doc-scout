import { redirect } from "react-router";
import { getCookieValue } from "~/.server/services/sessions/getCookieValue";
import { STYTCH_SESSION_TOKEN } from "~/config/auth";
import { appRoutes } from "~/shared/appRoutes";

export async function requireAnon({
  request,
}: {
  request: Request;
}): Promise<void> {
  const sessionToken = await getCookieValue({
    key: STYTCH_SESSION_TOKEN,
    request,
  });
  if (sessionToken) {
    throw redirect(appRoutes("/"));
  }
}
