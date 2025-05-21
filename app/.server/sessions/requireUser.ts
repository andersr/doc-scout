import { redirect } from "react-router";
import { STYTCH_SESSION_TOKEN } from "~/config/auth";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import type { UserClient } from "~/types/user";
import { stytchClient } from "../stytch/client";
import { getCookieValue } from "./getCookieValue";
import { logout } from "./logout";

export async function requireUser({
  request,
}: {
  request: Request;
}): Promise<{ user: UserClient }> {
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
      throw await logout({
        request,
      });
    }

    const email =
      resp.user.emails.length > 0 ? resp.user.emails[0].email : null;

    if (!email) {
      console.error("No user email");
      throw await logout({
        request,
      });
    }

    return {
      user: { email, publicId: user.publicId },
    };
  } catch (error) {
    console.error("error: ", error);
    throw await logout({
      request,
    });
  }
}
