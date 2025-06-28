import type { LoaderFunctionArgs } from "react-router";
import { Link, redirect, useLoaderData } from "react-router";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { PageHeading } from "~/components/layout/PageHeading";
import { ActionLink } from "~/components/ui/ActionLink";
import { DASHBOARD_TITLE } from "~/config/titles";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { formatDateTime } from "~/utils/formatDateTime";
import { setSourceTitle } from "~/utils/setSourceTitle";

export async function loader(args: LoaderFunctionArgs) {
  const { internalUser } = await requireUser(args);

  const docs = await prisma.source.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      ownerId: internalUser.id,
    },
  });

  if (docs.length === 0) {
    return redirect(appRoutes("/docs/new"));
  }

  return {
    docs,
    title: DASHBOARD_TITLE,
  };
}

export default function Dashboard() {
  const { docs, title } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      <PageHeading
        pageTitle={title}
        headingContent={
          <ActionLink to={appRoutes("/docs/new")}>Add Docs</ActionLink>
        }
      />
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docs.map((d) => (
          <Link
            key={d.publicId}
            to={appRoutes("/docs/:id", { id: d.publicId })}
            className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
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
  );
}
