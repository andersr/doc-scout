import type { LoaderFunctionArgs } from "react-router";
import { requireRouteParam } from "~/.server/utils/requireRouteParam";
import { requireSourceChat } from "~/.server/utils/requireSourceChat";
import { prisma } from "~/lib/prisma";
import { KEYS } from "~/shared/keys";
import { SOURCE_INCLUDE } from "~/types/source";

export async function requireSourceAndSourceChat({
  params,
}: {
  params: LoaderFunctionArgs["params"];
}) {
  const sourcePublicId = requireRouteParam({
    key: KEYS.id,
    params,
  });

  // TODO: add error boundary to handle thrown errors
  const source = await prisma.source.findFirstOrThrow({
    include: SOURCE_INCLUDE,
    where: {
      publicId: sourcePublicId,
    },
  });

  const sourceChat = requireSourceChat({ source });

  return { source, sourceChat };
}
