import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { type LoaderFunctionArgs, redirect } from "react-router";
import { upsertUser } from "~/.server/models/users/upsertUser";
import { createSession } from "~/.server/services/sessions/createSession";
import { isAllowedUser } from "~/.server/utils/isAllowedUser";
import redirectWithDomainHost from "~/.server/utils/redirectWithDomainHost";
import { stytchClient } from "~/.server/vendors/stytch/client";
import { STYTCH_SESSION_DURATION_MINUTES } from "~/config/auth";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { ServerError } from "~/types/server";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const token = searchParams.get(KEYS.token);
  const tokenType = searchParams.get("stytch_token_type");

  try {
    if (!token) {
      throw new ServerError(`No token`, StatusCodes.BAD_REQUEST);
    }

    let sessionToken = "";
    let accessToken = "";

    if (tokenType === "magic_links") {
      const res = await stytchClient.magicLinks.authenticate({
        session_duration_minutes: STYTCH_SESSION_DURATION_MINUTES,
        token,
      });
      sessionToken = res.session_token;
    }

    if (tokenType === "oauth") {
      const res = await stytchClient.oauth.authenticate({
        session_duration_minutes: STYTCH_SESSION_DURATION_MINUTES,
        token,
      });

      const email =
        res.user.emails.length > 0 ? res.user.emails[0].email : undefined;

      if (!email) {
        console.error("no user email");
        throw new ServerError(
          ReasonPhrases.BAD_REQUEST,
          StatusCodes.BAD_REQUEST,
        );
      }

      if (!isAllowedUser(email)) {
        return redirectWithDomainHost({
          request,
          route: appRoutes("/request-access", {
            email: email,
          }),
        });
      }

      sessionToken = res.session_token;
      accessToken = res.provider_values.access_token;

      await upsertUser({ stytchId: res.user_id });
    }

    if (!sessionToken) {
      console.error("no request token");
      throw new ServerError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
    }

    return createSession({
      accessToken,
      redirectTo: appRoutes("/"),
      request,
      sessionToken,
    });
  } catch (error) {
    console.error(`Login error: ${error}`);
    throw redirect(
      appRoutes("/login", {
        error: "true",
      }),
    );
  }
}
