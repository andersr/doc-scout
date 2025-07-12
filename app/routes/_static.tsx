import { Outlet, useLoaderData } from "react-router";

import { maybeUser } from "~/.server/services/sessions/maybeUser";
import { AppNav } from "~/components/layout/AppNav";
import { MainLayout } from "~/components/layout/MainLayout";
import { UserMenu } from "~/components/user/UserMenu";
import { ErrorBoundaryInfo } from "~/lib/errorBoundary/ErrorBoundaryInfo";
import { useErrorBoundary } from "~/lib/errorBoundary/useErrorBoundary";
import type { UserClient } from "~/types/user";
import type { Route } from "./+types/_static";

export async function loader({ request }: Route.LoaderArgs) {
  const userResult = await maybeUser({ request });

  if (userResult.success) {
    const { internalUser, stytchUser } = userResult.data;
    const email = stytchUser?.emails[0].email ?? "";
    return {
      user: { email, publicId: internalUser.publicId } satisfies UserClient,
    };
  }

  return {
    user: null,
  };
}

export default function StaticRoutes() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <MainLayout
      leftNav={user && <AppNav />}
      rightNav={<UserMenu user={user} />}
    >
      <Outlet />
    </MainLayout>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const output = useErrorBoundary(error);

  return (
    <MainLayout>
      <ErrorBoundaryInfo {...output} />
    </MainLayout>
  );
}
