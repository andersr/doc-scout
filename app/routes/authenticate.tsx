import { Link, type LoaderFunctionArgs, useLoaderData } from "react-router";
import { createSession } from "~/.server/sessions/createSession";
import { stytchClient } from "~/.server/vendors/stytch/client";
import {
  STYTCH_SESSION_DURATION_MINUTES,
  STYTCH_SESSION_TOKEN,
} from "~/config/auth";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";

export async function loader(args: LoaderFunctionArgs) {
  const { request } = args;
  try {
    const searchParams = new URL(request.url).searchParams;
    const token = searchParams.get("token");
    const tokenType = searchParams.get("stytch_token_type");

    if (!token) {
      console.error(`No token`);
      return new Response("Bad request", {
        status: 400,
      });
    }
    if (tokenType !== "magic_links") {
      console.error(`Unsupported token type: '${tokenType}'`);
      return new Response("Bad request", {
        status: 400,
      });
    }

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
  } catch (error) {
    console.error("Authenticate error: ", error);
    return {
      errorMessage:
        error instanceof Error && error.message
          ? error.message
          : INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    };
  }
}

export default function AuthenticateRoute() {
  const { errorMessage } = useLoaderData<typeof loader>();
  return (
    <div>
      {errorMessage && (
        <div className="mt-4 text-center font-semibold text-red-400">
          {errorMessage}
        </div>
      )}
      <div>
        <Link to={appRoutes("/login")}>Back to Loginn</Link>
      </div>
    </div>
  );
}
