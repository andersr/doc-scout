import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { requireUser } from "~/.server/users/requireUser";
import { PageTitle } from "~/components/PageTitle";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import type { RouteData } from "~/types/routeData";

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
      <div className="flex justify-between items-center">
        <PageTitle>{SECTION_NAME}</PageTitle>
        <Link
          to={appRoutes("/collections/new")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          New Collection
        </Link>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Link
              key={collection.publicId}
              to={appRoutes("/collections/:id", { id: collection.publicId })}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-medium">{collection.name}</h2>
              <div className="mt-2 text-sm text-gray-500">
                {collection.sources.length} source
                {collection.sources.length !== 1 ? "s" : ""}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Created:{" "}
                {collection.createdAt
                  ? new Date(collection.createdAt).toLocaleDateString()
                  : "N/A"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
