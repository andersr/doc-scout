import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { type ActionFunctionArgs, data } from "react-router";
import { createSession } from "~/.server/services/sessions/createSession";
import { requireEnvVar } from "~/.server/utils/requireEnvVar";
import { requireSearchParam } from "~/.server/utils/requireSearchParam";
import { stytchClient } from "~/.server/vendors/stytch/client";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const email = requireSearchParam({ key: KEYS.email, request });

    const authRes = await stytchClient.passwords.authenticate({
      email,
      password: requireEnvVar("TEST_USER_PWD"),
      session_duration_minutes: 30,
    });

    return createSession({
      key: KEYS.stytch_session_token,
      redirectTo: appRoutes("/"),
      request,
      token: authRes.session_token,
    });
  } catch (error) {
    console.error("E2E login error: ", error);
    throw data({ error: ReasonPhrases.BAD_REQUEST }, StatusCodes.BAD_REQUEST);
  }
};
