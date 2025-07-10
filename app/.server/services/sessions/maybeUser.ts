import { getCookieValue } from "~/.server/services/sessions/getCookieValue";
import { prisma } from "~/lib/prisma";
import {
  USER_INTERNAL_INCLUDE,
  type UserClient,
  type UserInternal,
} from "~/types/user";

import type { User as StytchUser } from "stytch";
import { stytchClient } from "~/.server/vendors/stytch/client";
import { getStytchUserById } from "~/.server/vendors/stytch/getStytchUserById";
import { KEYS } from "~/shared/keys";

export async function maybeUser({ request }: { request: Request }): Promise<
  | {
      data: {
        clientUser: UserClient;
        internalUser: UserInternal;
        stytchUser: StytchUser | undefined;
      };
      success: true;
    }
  | { error: string; success: false }
> {
  const sessionToken = await getCookieValue({
    key: KEYS.session_token,
    request,
  });

  if (!sessionToken) {
    return { error: "No session token", success: false };
  }

  try {
    const resp = await stytchClient.sessions.authenticate({
      session_token: sessionToken,
    });

    if (resp.status_code !== 200) {
      return { error: "Session invalid or expired", success: false };
    }

    if (!resp.user || !resp.user.user_id) {
      return { error: "No user found", success: false };
    }

    const user = await prisma.user.findUnique({
      include: USER_INTERNAL_INCLUDE,
      where: {
        stytchId: resp.user.user_id,
      },
    });

    if (!user) {
      return { error: "No user in db", success: false };
    }

    const stytchUser = await getStytchUserById(user.stytchId);

    return {
      data: {
        clientUser: {
          email: resp.user.emails[0].email,
          publicId: user.publicId,
        },
        internalUser: user,
        stytchUser,
      },
      success: true,
    };
  } catch (error) {
    return { error: `Session error: ${error}`, success: false };
  }
}
