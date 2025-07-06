import { StatusCodes } from "http-status-codes";
import { type LoaderFunctionArgs, redirect } from "react-router";
import { createSession } from "~/.server/services/sessions/createSession";
import { stytchClient } from "~/.server/vendors/stytch/client";
import {
  STYTCH_SESSION_DURATION_MINUTES,
  STYTCH_SESSION_TOKEN,
} from "~/config/auth";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { ServerError } from "~/types/server";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const token = searchParams.get(KEYS.token);
  console.info("token: ", token);
  const tokenType = searchParams.get("stytch_token_type");
  console.info("tokenType: ", tokenType);

  try {
    if (!token) {
      throw new ServerError(`No token`, StatusCodes.BAD_REQUEST);
    }

    if (tokenType === "magic_links") {
      const res = await stytchClient.magicLinks.authenticate({
        session_duration_minutes: STYTCH_SESSION_DURATION_MINUTES,
        token,
      });

      return createSession({
        key: STYTCH_SESSION_TOKEN,
        redirectTo: appRoutes("/"),
        request,
        token: res.session_token,
      });
    }

    if (tokenType === "oauth") {
      const res = await stytchClient.oauth.authenticate({
        session_duration_minutes: STYTCH_SESSION_DURATION_MINUTES,
        token,
      });
      console.info("OAUTH res: ", res);

      // const redirectUrl = res.

      return createSession({
        key: STYTCH_SESSION_TOKEN,
        redirectTo: appRoutes("/"),
        request,
        token: res.session_token,
      });
    }

    throw new ServerError("Unknown request type", StatusCodes.BAD_REQUEST);
  } catch (error) {
    console.error(`Login error: ${error}`);
    throw redirect(
      appRoutes("/login", {
        error: "true",
      }),
    );
  }
}
