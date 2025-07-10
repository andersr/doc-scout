import { redirect } from "react-router";
import { authSessionStore } from "~/.server/services/sessions/authSessionStore";
import { AUTH_DEFAULT_REDIRECT, AUTH_SESSION_DURATION } from "~/config/auth";
import { KEYS } from "~/shared/keys";
import { getSession } from "../getSession";

export async function createSession({
  accessToken,
  maxAge,
  redirectTo = AUTH_DEFAULT_REDIRECT,
  request,
  sessionToken,
}: {
  accessToken?: string;
  maxAge?: number;
  redirectTo?: string;
  request: Request;
  sessionToken: string;
}) {
  const session = await getSession({ request });
  session.set(KEYS.session_token, sessionToken);
  if (accessToken) {
    session.set(KEYS.access_token, accessToken);
  }

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await authSessionStore.commitSession(session, {
        maxAge: maxAge ?? AUTH_SESSION_DURATION,
      }),
    },
  });
}
