import { redirect } from "react-router";
import { AUTH_DEFAULT_REDIRECT, AUTH_SESSION_DURATION } from "~/config/auth";
import { authSessionStore } from "../authSessionStore";
import { getSession } from "../getSession";

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
