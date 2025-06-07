import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { requireUser } from "~/.server/sessions/requireUser";
import { ActionLink } from "~/components/ui/ActionLink";
import { PageHeading } from "~/components/ui/PageHeading";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { formatDateTime } from "~/utils/formatDateTime";

export async function loader(args: LoaderFunctionArgs) {
  const { internalUser } = await requireUser(args);

  const docs = await prisma.source.findMany({
    where: {
      ownerId: internalUser.id,
    },
  });

  return {
    docs,
    title: "Documents",
  };
}
export default function DocsList() {
  const { docs, title } = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeading pageTitle={title}>
        <ActionLink to={appRoutes("/docs/new")}>Add Docs</ActionLink>
      </PageHeading>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docs.map((d) => (
          <Link
            key={d.publicId}
            to={appRoutes("/docs/:id", { id: d.publicId })}
            className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-medium">{d.name ?? d.fileName}</h2>
            <div className="mt-2 text-xs text-gray-400">
              Created:{" "}
              {d.createdAt
                ? formatDateTime({ d: d.createdAt, withTime: true })
                : "N/A"}
            </div>
          </Link>
        ))}
      </ul>
    </>
  );
}
