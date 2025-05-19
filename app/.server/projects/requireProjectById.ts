import type { LoaderFunctionArgs } from "react-router";
import { prisma } from "~/lib/prisma";
import { PROJECT_SELECT_INTERNAL } from "~/types/project";
import type { UserInternal } from "~/types/user";
import { requireParam } from "../utils/requireParam";
import { requireProjectId } from "./requireProjectId";

export async function requireProjectById({
  params,
  user,
}: {
  params: LoaderFunctionArgs["params"];
  user: UserInternal;
}) {
  const projectPublicId = requireParam({ key: "id", params });

  const projectId = await requireProjectId({ projectPublicId, user });

  const project = await prisma.project.findFirstOrThrow({
    select: PROJECT_SELECT_INTERNAL,
    where: {
      id: projectId ?? -1,
    },
  });

  return project;
}
