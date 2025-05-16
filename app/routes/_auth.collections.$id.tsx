import { useState } from "react";
import Markdown from "react-markdown";
import type { LoaderFunctionArgs } from "react-router";
import { Link, redirect, useLoaderData } from "react-router";
import { requireParam } from "~/.server/utils/requireParam";
import { PageTitle } from "~/components/PageTitle";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { PARAMS } from "~/shared/params";
import type { RouteData } from "~/types/routeData";

export const handle: RouteData = {
  pageTitle: "Collection Details",
};

export function meta({ data }: { data: { collection: { name: string } } }) {
  return [
    { title: `Collection: ${data?.collection?.name || "Not Found"}` },
    { name: "description", content: "Collection details" },
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  // const currentUser = await requireUser(args);
  const collectionId = requireParam({
    params: args.params,
    key: PARAMS.ID,
  });

  const collection = await prisma.collection.findUnique({
    where: {
      publicId: collectionId,
    },
    include: {
      sources: true,
    },
  });

  if (!collection) {
    throw redirect(appRoutes("/collections"));
  }

  return { collection };
}

export default function CollectionDetails() {
  const { collection } = useLoaderData<typeof loader>();
  const [selectedSource, setSelectedSource] = useState<{
    id: string;
    text: string | null;
  } | null>(null);

  const handleSourceClick = (sourceId: string, text: string | null) => {
    setSelectedSource({
      id: sourceId,
      text,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <PageTitle>{collection.name}</PageTitle>
        <div className="flex gap-2">
          <Link
            to={appRoutes("/collections")}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Collections
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <h2 className="text-xl font-semibold mb-4">Sources</h2>
          {collection.sources.length === 0 ? (
            <p className="text-gray-500">No sources in this collection</p>
          ) : (
            <ul className="space-y-2">
              {collection.sources.map((source) => (
                <li
                  key={source.publicId}
                  className={`cursor-pointer hover:text-blue-600 break-all ${
                    selectedSource?.id === source.publicId ? "font-bold" : ""
                  }`}
                  onClick={() =>
                    handleSourceClick(source.publicId, source.text)
                  }
                >
                  {source.name || "Unnamed Source"}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedSource && (
          <div className="md:w-2/3">
            <h2 className="text-xl mb-2">Source Content</h2>
            <div className="border border-gray-300 rounded-md p-4 max-h-[80vh] overflow-y-auto">
              <div className="prose dark:prose-invert">
                <Markdown>{selectedSource.text || ""}</Markdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
