import { getCookieValue } from "~/.server/services/sessions/getCookieValue";
import { prisma } from "~/lib/prisma";
import {
  USER_INTERNAL_INCLUDE,
  type UserClient,
  type UserInternal,
} from "~/types/user";

import { StatusCodes } from "http-status-codes";
import { serverError } from "~/.server/utils/serverError";
import { stytchClient } from "~/.server/vendors/stytch/client";
import { KEYS } from "~/shared/keys";
import { ServerError } from "~/types/server";

export async function maybeUser({ request }: { request: Request }): Promise<{
  clientUser: UserClient;
  internalUser: UserInternal;
} | null> {
  const sessionToken = await getCookieValue({
    key: KEYS.stytch_session_token,
    request,
  });

  if (!sessionToken) {
    return null;
  }

  try {
    const resp = await stytchClient.sessions.authenticate({
      session_token: sessionToken,
    });

    if (resp.status_code !== 200) {
      throw new ServerError(
        "Session invalid or expired",
        StatusCodes.BAD_GATEWAY,
      );
    }

    if (!resp.user || !resp.user.user_id) {
      throw new ServerError("No user found", StatusCodes.BAD_GATEWAY);
    }

    const user = await prisma.user.findUnique({
      include: USER_INTERNAL_INCLUDE,
      where: {
        stytchId: resp.user.user_id,
      },
    });

    if (!user) {
      throw new ServerError("No user found", StatusCodes.BAD_REQUEST);
    }

    return {
      clientUser: {
        email: resp.user.emails[0].email,
        publicId: user.publicId,
      },
      internalUser: user,
    };
  } catch (error) {
    throw serverError(error);
  }
}
