import { redirect } from "react-router";
import { getCookieValue } from "~/.server/services/sessions/getCookieValue";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";

export async function requireAnon({
  request,
}: {
  request: Request;
}): Promise<void> {
  const sessionToken = await getCookieValue({
    key: KEYS.session_token,
    request,
  });
  if (sessionToken) {
    throw redirect(appRoutes("/"));
  }
}
