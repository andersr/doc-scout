import type { Session } from "react-router";
import { prisma } from "~/lib/prisma";
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
  if (!sessionToken) {
    throw logout({
      request,
    });
  }

  const resp = await stytchClient.sessions.authenticate({
    session_token: sessionToken,
  });
  const session = await getSessionCookie({ request });

  if (resp.status_code !== 200) {
    console.info("Session invalid or expired");
    throw logout({
      request,
    });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      stytchId: resp.user.user_id,
    },
  });

  // TODO:   req.session.STYTCH_SESSION_TOKEN = resp.session_token;
  return {
    session,
    user: { email: resp.user.emails[0].email, publicId: user.publicId },
  };
}
