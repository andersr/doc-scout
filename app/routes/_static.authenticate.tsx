import { Link, type LoaderFunctionArgs } from "react-router";
import { createSession } from "~/.server/services/sessions/createSession";
import { stytchClient } from "~/.server/vendors/stytch/client";
import { PageTitle } from "~/components/PageTitle";
import {
  STYTCH_SESSION_DURATION_MINUTES,
  STYTCH_SESSION_TOKEN,
} from "~/config/auth";
import { appRoutes } from "~/shared/appRoutes";
import { LINK_STYLES } from "~/styles/links";

export async function loader(args: LoaderFunctionArgs) {
  const { request } = args;
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
}

export default function AuthenticateRoute() {
  return (
    <div>
      <div>
        <PageTitle title={"Auth Error"} />
      </div>
      <div>
        <Link className={LINK_STYLES} to={appRoutes("/login")}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}
