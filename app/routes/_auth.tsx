import { data, Link, Outlet, useLoaderData } from "react-router";
import { AppNav } from "~/components/AppNav";

import { requireUser } from "~/.server/users";
import { Logout } from "~/components/Logout";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "./+types/_auth";

export function meta() {
  return [{ title: "Doc Scout" }, { content: "", name: "description" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { user } = await requireUser({ request });

  return data(
    { user },
    {
      // headers: {
      //   "Set-Cookie": await authSessionStore.commitSession(session),
      // },
    },
  );
}

export default function AuthLayout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div className="flex h-full flex-col p-4">
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
      </div>
      <main className="flex flex-1 flex-col py-4">
        <Outlet />
      </main>
    </div>
  );
}
