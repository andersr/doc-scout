import { data, Outlet, useLoaderData } from "react-router";

import { getStytchUserById } from "@vendors/stytch/getStytchUserById";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { MainLayout } from "~/components/layout/MainLayout";
import { useMoreMenu } from "~/hooks/useMoreMenu";
import { useRouteData } from "~/hooks/useRouteData";
import { prisma } from "~/lib/prisma";
import type { UserClient } from "~/types/user";
import type { Route } from "./+types/_auth";

export async function loader({ request }: Route.LoaderArgs) {
  const { internalUser } = await requireUser({ request });

  const stytchUser = await getStytchUserById(internalUser.stytchId);

  const sources = await prisma.source.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      ownerId: internalUser.id,
    },
  });

  const email = stytchUser?.emails[0].email ?? "";
  return data<{ user: UserClient }>({
    user: { email, publicId: internalUser.publicId, sources },
  });
}

export default function MainLayoutRoutes() {
  const { user } = useLoaderData<typeof loader>();
  const { actionsInput, noFooter, pageTitle, whiteBackground } = useRouteData();

  const moreActions = useMoreMenu(actionsInput);

  return (
    <MainLayout
      noFooter={noFooter}
      moreActions={moreActions}
      pageTitle={pageTitle}
      user={user}
      whiteBackground={whiteBackground}
    >
      <Outlet />
    </MainLayout>
  );
}
