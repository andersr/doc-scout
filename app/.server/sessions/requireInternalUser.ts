import { redirect } from "react-router";
import { STYTCH_SESSION_TOKEN } from "~/config/auth";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { USER_INTERNAL_INCLUDE, type UserInternal } from "~/types/user";
import { stytchClient } from "../stytch/client";
import { getCookieValue } from "./getCookieValue";
import { logout } from "./logout";

export async function requireInternalUser({
  request,
}: {
  request: Request;
}): Promise<UserInternal> {
  const sessionToken = await getCookieValue({
    key: STYTCH_SESSION_TOKEN,
    request,
  });
  // TODO: DRY up - same code in requireUser
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
      include: USER_INTERNAL_INCLUDE,
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

    return user;
  } catch (error) {
    console.error("error: ", error);
    throw await logout({
      request,
    });
  }
}
