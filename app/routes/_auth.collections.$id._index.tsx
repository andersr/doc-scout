import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
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

export default function CollectionDetails() {
  // const { collection } = useLoaderData<typeof loader>();
  // const [selectedSource, setSelectedSource] = useState<{
  //   id: string;
  //   text: string | null;
  // } | null>(null);

  // const handleSourceClick = (sourceId: string, text: string | null) => {
  //   setSelectedSource({
  //     id: sourceId,
  //     text,
  //   });
  // };

  return null;
  // return (
  //   <div className="flex flex-col gap-6 w-full">
  //     <div className="flex justify-between items-center">
  //       <PageTitle>Collection: {collection.name}</PageTitle>
  //       {/* <div className="flex gap-2">
  //         <Link
  //           to={appRoutes("/collections")}
  //           className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
  //         >
  //           Back to Collections
  //         </Link>
  //       </div> */}
  //     </div>

  //     <div className="flex flex-col md:flex-row gap-6 w-full">
  //       <div className="w-96">
  //         <h2 className="text-xl font-semibold mb-4">Sources</h2>
  //         {collection.sources.length === 0 ? (
  //           <p className="text-gray-500">No sources in this collection</p>
  //         ) : (
  //           <ul className="space-y-2">
  //             {collection.sources.map((source) => (
  //               <li
  //                 key={source.publicId}
  //                 className={`cursor-pointer hover:text-blue-600 break-all ${
  //                   selectedSource?.id === source.publicId ? "font-bold" : ""
  //                 }`}
  //                 onClick={() =>
  //                   handleSourceClick(source.publicId, source.text)
  //                 }
  //               >
  //                 {source.name || "Unnamed Source"}
  //               </li>
  //             ))}
  //           </ul>
  //         )}
  //       </div>

  //       {selectedSource && (
  //         <div className="flex-1">
  //           <h2 className="text-xl mb-2">Source Content</h2>
  //           <div className="border border-gray-300 rounded-md p-4 w-full h-[75vh] overflow-scroll prose !max-w-none">
  //             <Markdown>{selectedSource.text || ""}</Markdown>
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
}
