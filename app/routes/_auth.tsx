import { data, Link, Outlet, useLoaderData } from "react-router";
import { AppNav } from "~/components/AppNav";

import { authSessionStore } from "~/.server/sessions/authSessionStore";
import { getAuthenticatedUser } from "~/.server/stytch/getAuthenticatedUser";
import { Logout } from "~/components/Logout";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "./+types/_auth";

export function meta() {
  return [{ title: "Dashboard" }, { content: "", name: "description" }];
}

export async function loader(args: Route.LoaderArgs) {
  const { session, user } = await getAuthenticatedUser(args.request);

  return data(
    { user },
    {
      headers: {
        "Set-Cookie": await authSessionStore.commitSession(session),
      },
    },
  );
}

export default function AuthLayout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center gap-2">
        <AppNav />
        {user ? (
          <div className="flex gap-2">
            <div>{user.email}</div>
            <Logout />
          </div>
        ) : (
          <div>
            <Link to={appRoutes("/login")}>Sign In</Link>
          </div>
        )}
        {/* <SignedOut>
          <SignInButton />
        </SignedOut> */}
        {/* <SignedIn>
          <UserButton />
        </SignedIn> */}
      </div>
      <main className="py-4 flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
