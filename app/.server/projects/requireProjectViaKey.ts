import { ReasonPhrases, StatusCodes } from "http-status-codes";
import type { LoaderFunctionArgs } from "react-router";
import { prisma } from "~/lib/prisma";
import { APIError } from "~/types/api";
import { PROJECT_SELECT_CLIENT } from "~/types/project";
import { requireApiKey } from "../auth/requireApiKey";
import { requireParam } from "../utils/requireParam";

export async function requireProjectViaKey({
  params,
  request,
}: {
  params: LoaderFunctionArgs["params"];
  request: Request;
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
    select: PROJECT_SELECT_CLIENT,
    where: {
      id: projectKey.project?.id,
    },
  });

  if (projectPublicIdParam !== project.publicId) {
    throw new APIError(ReasonPhrases.FORBIDDEN, StatusCodes.FORBIDDEN);
  }

  return project;
}
