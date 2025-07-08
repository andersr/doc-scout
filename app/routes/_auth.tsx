import { data, Link, Outlet, useLoaderData } from "react-router";

import { requireUser } from "~/.server/services/sessions/requireUser";
import { getStytchUserById } from "~/.server/vendors/stytch/getStytchUserById";
import { AppContainer } from "~/components/layout/AppContainer";
import AppHeader from "~/components/layout/AppHeader";
import { MainContentContainer } from "~/components/layout/MainContentContainer";
import { DropdownMenu } from "~/components/ui/DropdownMenu";
import { Avatar } from "~/components/user/Avatar";
import { LogoutBtn } from "~/components/user/LogoutBtn";
import { ErrorBoundaryInfo } from "~/lib/errorBoundary/ErrorBoundaryInfo";
import { useErrorBoundary } from "~/lib/errorBoundary/useErrorBoundary";
import { appRoutes } from "~/shared/appRoutes";
import type { UserClient } from "~/types/user";
import type { Route } from "./+types/_auth";

export async function loader({ request }: Route.LoaderArgs) {
  const { internalUser } = await requireUser({ request });

  const stytchUser = await getStytchUserById(internalUser.stytchId);

  const email = stytchUser?.emails[0].email ?? "";
  return data<{ user: UserClient }>({
    user: { email, publicId: internalUser.publicId },
  });
}

// const NAV_LINKS: { label: string; route: string }[] = [
//   { label: "Docs", route: appRoutes("/docs") },
//   { label: "Chats", route: appRoutes("/chats") },
// ];

function Layout({
  children,
  isError,
  user,
}: {
  children: React.ReactNode;
  isError?: boolean;
  user: UserClient | null;
}) {
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
                <LogoutBtn key="logout" />,
              ]}
            >
              <Avatar email={user.email} />
            </DropdownMenu>
          ) : isError ? null : (
            <div>
              <Link to={appRoutes("/login")}>Sign In</Link>
            </div>
          )}
        </div>
      </AppHeader>
      <MainContentContainer>{children}</MainContentContainer>
    </AppContainer>
  );
}

export default function AuthRoutes() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <Layout user={user}>
      <Outlet />
    </Layout>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const output = useErrorBoundary(error);

  return (
    <Layout user={null} isError>
      <ErrorBoundaryInfo {...output} />
    </Layout>
  );
}
