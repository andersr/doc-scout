import { Role } from "@prisma/client";
import { redirect } from "react-router";
import { apiError } from "~/.server/api/apiError";
import { requireUser } from "~/.server/users/requireUser";
import { requireParam } from "~/.server/utils/requireParam";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "../+types/root";

export async function action(args: Route.ActionArgs) {
  const currentUser = await requireUser(args);
  try {
    const projectPublicId = requireParam({ key: "id", params: args.params });
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

    if (args.request.method !== "DELETE") {
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
    console.error("project delete error: ", error);
    return apiError(error);
  }
}
