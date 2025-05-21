import { redirect, type Session } from "react-router";
import { STYTCH_SESSION_TOKEN } from "~/config/auth";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import type { UserClient } from "~/types/user";
import { getCookieValue } from "../sessions/getCookieValue";
import { getSession } from "../sessions/getSession";
import { logout } from "../sessions/logout";
import { stytchClient } from "./client";

export async function getAuthenticatedUser(
  request: Request,
): Promise<{ session: Session; user: UserClient }> {
  const sessionToken = await getCookieValue({
    key: STYTCH_SESSION_TOKEN,
    request,
  });
  if (!sessionToken) {
    throw redirect(appRoutes("/login"));
  }

  try {
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

    if (!resp.user || !resp.user.user_id) {
      console.error("No user found");
      throw redirect(appRoutes("/login"));
    }

    const user = await prisma.user.findUnique({
      where: {
        stytchId: resp.user.user_id,
      },
    });

    if (!user) {
      console.error("No user in db");
      throw redirect(appRoutes("/login"));
    }

    const email =
      resp.user.emails.length > 0 ? resp.user.emails[0].email : null;

    if (!email) {
      console.error("No user email");
      throw redirect(appRoutes("/login"));
    }

    return {
      session,
      user: { email, publicId: user.publicId },
    };
  } catch (error) {
    console.error("error: ", error);
    throw await logout({
      request,
    });
  }
}
