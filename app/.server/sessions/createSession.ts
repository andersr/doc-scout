import { redirect } from "react-router";
import {
  AUTH_DEFAULT_REDIRECT,
  AUTH_SESSION_DURATION,
  AUTH_USER_KEY,
} from "~/config/auth";
import { authSessionStore } from "./authSessionStore";
import { getSessionCookie } from "./getSessionCookie";

export async function createSession({
  request,
  publicId,
  remember,
  redirectTo = AUTH_DEFAULT_REDIRECT,
}: {
  request: Request;
  publicId: string;
  remember: boolean;
  redirectTo?: string;
}) {
  const cookie = await getSessionCookie({ request });
  cookie.set(AUTH_USER_KEY, publicId);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await authSessionStore.commitSession(cookie, {
        maxAge: remember ? AUTH_SESSION_DURATION : undefined,
      }),
    },
  });
}
