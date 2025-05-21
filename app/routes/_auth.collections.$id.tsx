import type { LoaderFunctionArgs } from "react-router";
import { Link, Outlet, redirect, useLoaderData } from "react-router";
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

export default function CollectionDetailsLayout() {
  const { collection } = useLoaderData<typeof loader>();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <PageTitle>Collection: {collection.name}</PageTitle>
      </div>

      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div className="">
          <ul className="space-y-2">
            <li className={`cursor-pointer break-all hover:text-blue-600`}>
              <Link
                to={appRoutes("/collections/:id/sources", {
                  id: collection.publicId,
                })}
              >
                Sources
              </Link>
            </li>
            <li className={`cursor-pointer break-all hover:text-blue-600`}>
              <Link
                to={appRoutes("/collections/:id/chat", {
                  id: collection.publicId,
                })}
              >
                Chat
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
