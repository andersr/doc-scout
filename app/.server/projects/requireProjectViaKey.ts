import { ReasonPhrases, StatusCodes } from "http-status-codes";
import type { LoaderFunctionArgs } from "react-router";
import { prisma } from "~/lib/prisma";
import { APIError } from "~/types/api";
import { requireApiKey } from "../auth/requireApiKey";
import { requireParam } from "../utils/requireParam";

export async function requireProjectViaKey({
  request,
  params,
}: {
  request: Request;
  params: LoaderFunctionArgs["params"];
}) {
  const projectPublicIdParam = requireParam({ key: "id", params });

  const projectKey = await requireApiKey({ request });

  if (!projectKey.project?.id) {
    throw new APIError(
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  const project = await prisma.project.findUniqueOrThrow({
    where: {
      id: projectKey.project?.id,
    },
    select: {
      name: true,
      collectionName: true,
      createdAt: true,
      publicId: true,
    },
  });

  if (projectPublicIdParam !== project.publicId) {
    throw new APIError(ReasonPhrases.FORBIDDEN, StatusCodes.FORBIDDEN);
  }

  return project;
}
