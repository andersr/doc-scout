import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { type ActionFunctionArgs, data } from "react-router";
import { createSession } from "~/.server/services/sessions/createSession";
import { stytchClient } from "~/.server/stytch/client";
import { requireSearchParam } from "~/.server/utils/requireSearchParam";
import { STYTCH_SESSION_TOKEN } from "~/config/auth";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const email = requireSearchParam({ key: KEYS.email, request });
    const password = requireSearchParam({ key: KEYS.password, request });

    const authRes = await stytchClient.passwords.authenticate({
      email,
      password,
      session_duration_minutes: 60,
    });

    return createSession({
      key: STYTCH_SESSION_TOKEN,
      redirectTo: appRoutes("/"),
      request,
      token: authRes.session_token,
    });
  } catch (error) {
    console.error("error: ", error);
    throw data({ error: ReasonPhrases.BAD_REQUEST }, StatusCodes.BAD_REQUEST);
  }
};
