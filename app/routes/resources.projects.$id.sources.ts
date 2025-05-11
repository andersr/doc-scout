import { Role } from "@prisma/client";
import { redirect } from "react-router";
import { apiError } from "~/.server/api/apiError";
import { requireProjectId } from "~/.server/projects/requireProjectId";
import { requireUser } from "~/.server/users/requireUser";
import { requireParam } from "~/.server/utils/requireParam";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "../+types/root";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireUser({ request });
  try {
    const projectPublicId = requireParam({ key: "id", params });
    const projectId = await requireProjectId({ user, projectPublicId });

    const sources = await prisma.source.findMany({
      where: {
        projectId: projectId ?? -1,
        url: {
          in: ["asdasd"],
        },
      },
    });

    return {
      sources,
    };
  } catch (error) {
    return apiError(error);
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const currentUser = await requireUser({ request });
  try {
    const projectPublicId = requireParam({ params, key: "id" });
    // TODO: turn into util
    const projectMembership = currentUser?.projectMemberships.find(
      (pm) => pm.project?.publicId === projectPublicId,
    );

    if (!projectMembership) {
      throw new Error(
        "No matching project found or current user is not a member",
      );
    }

    if (projectMembership.role !== Role.ADMIN) {
      throw new Error("Insufficient permissions to complete this action");
    }

    if (request.method !== "DELETE") {
      // return correct code
      throw new Error("Bad request");
    }

    const projectId = projectMembership.project?.id;

    if (!projectId) {
      throw new Error("No project id found");
    }

    await prisma.project.delete({
      where: { id: projectId ?? -1 },
    });

    return redirect(appRoutes("/"));
  } catch (error) {
    return apiError(error);
  }
}
