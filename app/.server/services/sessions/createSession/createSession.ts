import { redirect } from "react-router";
import { authSessionStore } from "~/.server/services/sessions/authSessionStore";
import { getSession } from "~/.server/sessions/getSession";
import { AUTH_DEFAULT_REDIRECT, AUTH_SESSION_DURATION } from "~/config/auth";

export async function createSession({
  key,
  maxAge,
  redirectTo = AUTH_DEFAULT_REDIRECT,
  request,
  token,
}: {
  key: string;
  maxAge?: number;
  redirectTo?: string;
  request: Request;
  token: string;
}) {
  const session = await getSession({ request });
  session.set(key, token);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await authSessionStore.commitSession(session, {
        maxAge: maxAge ?? AUTH_SESSION_DURATION,
      }),
    },
  });
}
