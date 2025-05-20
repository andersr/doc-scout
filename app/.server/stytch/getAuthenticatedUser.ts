import { redirect, type Session } from "react-router";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import type { UserClient } from "~/types/user";
import { getCookieValue } from "../sessions/getCookieValue";
import { getSessionCookie } from "../sessions/getSessionCookie";
import { logout } from "../sessions/logout";
import { STYTCH_SESSION_TOKEN, stytchClient } from "./client";

export async function getAuthenticatedUser(
  request: Request,
): Promise<{ session: Session; user: UserClient }> {
  const sessionToken = await getCookieValue({
    key: STYTCH_SESSION_TOKEN,
    request,
  });
  console.info("sessionToken: ", sessionToken);
  if (!sessionToken) {
    throw redirect(appRoutes("/login"));
    // throw logout({
    //   request,
    // });
  }

  const resp = await stytchClient.sessions.authenticate({
    session_token: sessionToken,
  });
  console.info("resp: ", resp);
  const session = await getSessionCookie({ request });
  console.info("session: ", session);

  if (resp.status_code !== 200) {
    console.info("Session invalid or expired");
    throw logout({
      request,
    });
  }

  if (!resp.user || !resp.user.user_id) {
    console.info("No user found");
    throw redirect(appRoutes("/login"));
  }

  const user = await prisma.user.findUnique({
    where: {
      stytchId: resp.user.user_id,
    },
  });

  if (!user) {
    throw redirect(appRoutes("/login"));
  }

  // TODO:   req.session.STYTCH_SESSION_TOKEN = resp.session_token;
  return {
    session,
    user: { email: resp.user.emails[0].email, publicId: user.publicId },
  };
}
