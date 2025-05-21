import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { requireUser } from "~/.server/sessions/requireUser";
import { PageTitle } from "~/components/PageTitle";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import type { RouteData } from "~/types/routeData";
import { formatDateTime } from "~/utils/formatDateTime";

const SECTION_NAME = "Collections";

export const handle: RouteData = {
  pageTitle: SECTION_NAME,
};

export function meta() {
  return [
    { title: SECTION_NAME },
    { content: "Manage your collections", name: "description" },
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  await requireUser(args);

  const collections = await prisma.collection.findMany({
    include: {
      sources: true,
    },
  });

  return {
    collections,
  };
}

export default function CollectionsList() {
  const { collections } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageTitle>{SECTION_NAME}</PageTitle>
        <Link
          to={appRoutes("/collections/new")}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          New Collection
        </Link>
      </div>

      {collections.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">No collections found</p>
          <p className="mt-2">
            <Link
              to={appRoutes("/collections/new")}
              className="text-blue-500 hover:underline"
            >
              Create your first collection
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.publicId}
              to={appRoutes("/collections/:id", { id: collection.publicId })}
              className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
            >
              <h2 className="text-lg font-medium">{collection.name}</h2>
              <div className="mt-2 text-sm text-gray-500">
                {collection.sources.length} document
                {collection.sources.length !== 1 ? "s" : ""}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Created:{" "}
                {collection.createdAt
                  ? formatDateTime({ d: collection.createdAt, withTime: true })
                  : "N/A"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
