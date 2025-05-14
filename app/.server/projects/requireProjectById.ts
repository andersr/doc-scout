import type { LoaderFunctionArgs } from "react-router";
import { prisma } from "~/lib/prisma";
import { PROJECT_SELECT_INTERNAL } from "~/types/project";
import type { UserInternal } from "~/types/user";
import { requireParam } from "../utils/requireParam";
import { requireProjectId } from "./requireProjectId";

export async function requireProjectById({
  user,
  params,
}: {
  user: UserInternal;
  params: LoaderFunctionArgs["params"];
}) {
  const projectPublicId = requireParam({ key: "id", params });

  const projectId = await requireProjectId({ user, projectPublicId });

  const project = await prisma.project.findFirstOrThrow({
    where: {
      id: projectId ?? -1,
    },
    select: PROJECT_SELECT_INTERNAL,
  });

  return project;
}
