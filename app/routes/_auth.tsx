import { data, Link, Outlet, useLoaderData } from "react-router";

import { requireUser } from "~/.server/services/sessions/requireUser";
import { AppContainer } from "~/components/AppContainer";
import AppHeader from "~/components/AppHeader";
import { Avatar } from "~/components/Avatar";
import { DropdownMenu } from "~/components/DropdownMenu";
import { Logout } from "~/components/logout";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "./+types/_auth";

export async function loader({ request }: Route.LoaderArgs) {
  const { clientUser } = await requireUser({ request });

  return data({ user: clientUser });
}

// const NAV_LINKS: { label: string; route: string }[] = [
//   { label: "Docs", route: appRoutes("/docs") },
//   { label: "Chats", route: appRoutes("/chats") },
// ];

export default function AuthLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <AppContainer>
      <AppHeader>
        {/* {NAV_LINKS.map((l) => (
          <Link className="md:text-2xl" key={l.label} to={l.route}>
            {l.label}
          </Link>
        ))} */}
        <div className="pl-1">
          {user ? (
            <DropdownMenu
              items={[
                <div className="truncate p-2" key={user.email}>
                  {user.email}
                </div>,
                <Logout key="logout" />,
              ]}
            >
              <Avatar email={user.email} />
            </DropdownMenu>
          ) : (
            <div>
              <Link to={appRoutes("/login")}>Sign In</Link>
            </div>
          )}
        </div>
      </AppHeader>
      <main className="mx-auto flex w-full flex-1 flex-col gap-6 py-6 md:max-w-5xl md:min-w-3xl md:py-12">
        <Outlet />
      </main>
    </AppContainer>
  );
}
