import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { requireInternalUser } from "~/.server/sessions/requireInternalUser";
import { ActionLink } from "~/components/ui/ActionLink";
import { PageHeading } from "~/components/ui/PageHeading";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import type { RouteData } from "~/types/routeData";
import { formatDateTime } from "~/utils/formatDateTime";

const SECTION_NAME = "Documents";

export const handle: RouteData = {
  pageTitle: SECTION_NAME,
};

export function meta() {
  return [
    { title: SECTION_NAME },
    { content: "My Documents", name: "description" },
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  const user = await requireInternalUser(args);

  const docs = await prisma.source.findMany({
    where: {
      ownerId: user.id,
    },
  });

  return {
    docs,
  };
}
export default function DocsList() {
  const { docs } = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeading pageTitle={SECTION_NAME}>
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
