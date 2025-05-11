import { Role } from "@prisma/client";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { APIError } from "~/types/api";
import type { UserInternal } from "~/types/user";

export async function requireProjectId({
  user,
  projectPublicId,
  requireAdmin,
}: {
  user: UserInternal;
  projectPublicId: string;
  requireAdmin?: boolean;
}) {
  const projectMembership = user.projectMemberships.find(
    (pm) => pm.project?.publicId === projectPublicId,
  );

  if (!projectMembership) {
    // TODO: refactor Api error to only require status code (do lookup) and an optional custom message
    throw new APIError(ReasonPhrases.FORBIDDEN, StatusCodes.FORBIDDEN);
  }

  if (requireAdmin && projectMembership.role !== Role.ADMIN) {
    // throw new Error("Insufficient permissions to complete this action");
    throw new APIError(ReasonPhrases.FORBIDDEN, StatusCodes.FORBIDDEN);
  }

  const projectId = projectMembership.project?.id;

  if (!projectId) {
    // throw new Error("No project id found");
    throw new APIError(ReasonPhrases.BAD_GATEWAY, StatusCodes.BAD_GATEWAY);
  }

  return projectId;
}
