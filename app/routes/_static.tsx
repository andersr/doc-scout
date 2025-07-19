import { Outlet, useLoaderData } from "react-router";

import { maybeUser } from "~/.server/services/sessions/maybeUser";
import { MainLayout } from "~/components/layout/MainLayout";
import { useRouteData } from "~/hooks/useRouteData";
import type { Route } from "./+types/_static";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await maybeUser({ request });

  return {
    user: user?.clientUser ?? null,
  };
}

export default function MainLayoutRoutes() {
  const { user } = useLoaderData<typeof loader>();
  const { pageTitle, whiteBackground } = useRouteData();

  return (
    <MainLayout
      whiteBackground={whiteBackground}
      pageTitle={pageTitle}
      user={user}
    >
      <Outlet />
    </MainLayout>
  );
}
