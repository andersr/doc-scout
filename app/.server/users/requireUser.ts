import { type LoaderFunctionArgs, type Session } from "react-router";
import { STYTCH_SESSION_TOKEN } from "~/config/auth";
import { prisma } from "~/lib/prisma";
import type { UserClient } from "~/types/user";
import { getCookieValue } from "../sessions/getCookieValue";
import { getSession } from "../sessions/getSession";
import { logout } from "../sessions/logout";
import { stytchClient } from "../stytch/client";

// TODO:this is the same as getAuthenticatedUser
// TODO: uninstall clerk packages
export async function requireUser({
  request,
}: LoaderFunctionArgs): Promise<{ session: Session; user: UserClient }> {
  const sessionToken = await getCookieValue({
    key: STYTCH_SESSION_TOKEN,
    request,
  });
  if (!sessionToken) {
    throw await logout({
      request,
    });
  }

  const resp = await stytchClient.sessions.authenticate({
    session_token: sessionToken,
  });
  const session = await getSession({ request });

  if (resp.status_code !== 200) {
    console.info("Session invalid or expired");
    throw await logout({
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
