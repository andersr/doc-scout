import { data, Link, Outlet, useLoaderData, useLocation } from "react-router";

import { requireUser } from "~/.server/users";
import { AppContainer } from "~/components/AppContainer";
import { Avatar } from "~/components/Avatar";
import { FoldedDoc } from "~/components/brand/FoldedDoc";
import { DropdownMenu } from "~/components/DropdownMenu";
import { Logout } from "~/components/logout";
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

const NAV_LINKS: { label: string; route: string }[] = [
  { label: "Docs", route: appRoutes("/docs") },
  { label: "Chats", route: appRoutes("/chats") },
];

export default function AuthLayout() {
  const { user } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();

  const isHome = pathname === "/";

  const brand = (
    <div className="text-pompadour/70 flex items-baseline">
      <FoldedDoc size={28} />
      <div className="pl-2 text-3xl font-stretch-50% md:pl-3 md:text-4xl">
        Doc Scout
      </div>
    </div>
  );
  return (
    <AppContainer>
      <div className="flex place-items-baseline gap-2 md:gap-4">
        <div className="flex-1">
          {isHome ? brand : <Link to={appRoutes("/")}>{brand}</Link>}
        </div>
        {NAV_LINKS.map((l) => (
          <Link className="md:text-2xl" key={l.label} to={l.route}>
            {l.label}
          </Link>
        ))}
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
      </div>
      <main className="mx-auto flex max-w-6xl flex-1 flex-col gap-6 py-6 md:py-12">
        <Outlet />
      </main>
    </AppContainer>
  );
}
