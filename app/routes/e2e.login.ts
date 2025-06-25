import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { type ActionFunctionArgs, data } from "react-router";
import { createSession } from "~/.server/services/sessions/createSession";
import { requireSearchParam } from "~/.server/utils/requireSearchParam";
import { stytchClient } from "~/.server/vendors/stytch/client";
import { STYTCH_SESSION_TOKEN } from "~/config/auth";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";

// TODO: turn into e2e.$command ?
// TODO: reduce session duration ?

const testUserPwd: string = process.env.TEST_USER_PWD ?? "";
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    if (testUserPwd === "") {
      throw new Error("No test user password");
    }
    const email = requireSearchParam({ key: KEYS.email, request });

    const authRes = await stytchClient.passwords.authenticate({
      email,
      password: testUserPwd,
      session_duration_minutes: 60,
    });

    return createSession({
      key: STYTCH_SESSION_TOKEN,
      redirectTo: appRoutes("/"),
      request,
      token: authRes.session_token,
    });
  } catch (error) {
    console.error("E2E login error: ", error);
    throw data({ error: ReasonPhrases.BAD_REQUEST }, StatusCodes.BAD_REQUEST);
  }
};
