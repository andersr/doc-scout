import { Link, redirect, useLoaderData } from "react-router";
import { maybeUser } from "~/.server/services/sessions/maybeUser";
import LandingPage from "~/components/LandingPage";
import { MainLayout } from "~/components/layout/MainLayout";
import { FloatingCTA } from "~/components/ui/buttons/FloatingCTA";
import { DASHBOARD_TITLE } from "~/config/titles";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import type { RouteData } from "~/types/routes";
import { formatDateTime } from "~/utils/formatDateTime";
import { setSourceTitle } from "~/utils/setSourceTitle";
import type { Route } from "./+types/_index";

export const handle: RouteData = {
  pageTitle: DASHBOARD_TITLE,
};

export async function loader({ request }: Route.LoaderArgs) {
  const user = await maybeUser({ request });

  if (user) {
    const sources = await prisma.source.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        ownerId: user.internalUser.id,
      },
    });

    if (sources.length === 0) {
      return redirect(appRoutes("/docs/new"));
    }
    return {
      user: {
        ...user.clientUser,
        sources,
      },
    };
  }

  return {
    user: null,
  };
}

export default function HomePage() {
  const { user } = useLoaderData<typeof loader>();

  return user ? (
    <MainLayout user={user} pageTitle={DASHBOARD_TITLE}>
      {user.sources.length === 0 ? (
        <div>
          No docs added. <Link to={appRoutes("/docs/new")}>Add docs</Link>.
        </div>
      ) : (
        <div>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.sources.map((d) => (
              <Link
                key={d.publicId}
                to={appRoutes("/docs/:id", { id: d.publicId })}
                className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <h2 className="text-lg font-medium">{setSourceTitle(d)}</h2>
                <div className="mt-2 text-xs text-gray-400">
                  Created:{" "}
                  {d.createdAt
                    ? formatDateTime({ d: d.createdAt, withTime: true })
                    : "N/A"}
                </div>
              </Link>
            ))}
          </ul>
        </div>
      )}
      <FloatingCTA to={appRoutes("/docs/new")} label="Add Doc(s)" />
    </MainLayout>
  ) : (
    <LandingPage />
  );
}
