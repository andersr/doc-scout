import { Role } from "@prisma/client";
import { data, redirect } from "react-router";
import { requireUser } from "~/.server/users/requireUser";
import { requireParam } from "~/.server/utils/requireParam";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { ActionData } from "~/types/actionData";
import type { Route } from "../+types/root";

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

    // TODO: use flash message provider instead?
    return redirect(appRoutes("/"));

    // return data<ActionData>({
    //   errorMessage: "",
    //   successMessage: "Project deleted.",
    //   ok: true,
    // });
  } catch (error) {
    console.error("project delete error: ", error);
    return data<ActionData>({
      errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    });
  }
}
