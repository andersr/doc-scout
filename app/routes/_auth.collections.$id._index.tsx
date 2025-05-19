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
  return null;
}
