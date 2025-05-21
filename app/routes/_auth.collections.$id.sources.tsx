import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import type { LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { requireParam } from "~/.server/utils/requireParam";
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
    { content: "Collection details", name: "description" },
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  const collectionId = requireParam({
    key: PARAMS.ID,
    params: args.params,
  });

  const collection = await prisma.collection.findUnique({
    include: {
      sources: true,
    },
    where: {
      publicId: collectionId,
    },
  });

  if (!collection) {
    throw redirect(appRoutes("/collections"));
  }

  return { collection };
}

type SourceItem = { publicId: string; text: string | null };

export default function CollectionDetails() {
  const { collection } = useLoaderData<typeof loader>();
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);

  useEffect(() => {
    if (!selectedSource && collection.sources.length > 0) {
      const source = collection.sources[0];
      setSelectedSource({
        publicId: source.publicId,
        text: source.text ?? "",
      });
    }
  }, [collection.sources, selectedSource]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="mb-4 text-xl font-semibold">Sources</h2>
      </div>

      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="min-w-52">
          {collection.sources.length === 0 ? (
            <p className="text-gray-500">No sources in this collection</p>
          ) : (
            <ul className="space-y-2">
              {collection.sources.map((source) => (
                <li
                  key={source.publicId}
                  className={`cursor-pointer break-all hover:text-blue-600 ${
                    selectedSource?.publicId === source.publicId
                      ? "font-bold"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedSource({
                      publicId: source.publicId,
                      text: source.text,
                    })
                  }
                >
                  {source.name || "Unnamed Source"}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedSource && (
          <div className="flex-1">
            <h2 className="mb-2 text-xl">Source Content</h2>
            <div className="prose h-[75vh] w-full !max-w-none overflow-scroll rounded-md border border-gray-300 p-4">
              <Markdown>{selectedSource.text || ""}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
