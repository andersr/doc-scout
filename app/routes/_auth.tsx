import { data, Link, Outlet, useLoaderData } from "react-router";

import { requireUser } from "~/.server/services/sessions/requireUser";
import { getStytchUserById } from "~/.server/vendors/stytch/getStytchUserById";
import { AppContainer } from "~/components/AppContainer";
import AppHeader from "~/components/AppHeader";
import { Avatar } from "~/components/Avatar";
import { DropdownMenu } from "~/components/DropdownMenu";
import { Logout } from "~/components/logout";
import { MainContentContainer } from "~/components/MainContentContainer";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "./+types/_auth";

export async function loader({ request }: Route.LoaderArgs) {
  const { internalUser } = await requireUser({ request });
  const stytchUser = await getStytchUserById(internalUser.stytchId);

  const email = stytchUser?.emails[0].email ?? "";
  return data({ user: { email } });
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
                // <div className="truncate p-2" key={user.email}>
                //   {user.email}
                // </div>,
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
      <MainContentContainer>
        <Outlet />
      </MainContentContainer>
    </AppContainer>
  );
}
