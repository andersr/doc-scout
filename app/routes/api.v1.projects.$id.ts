import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { data } from "react-router";
import { requireProjectId } from "~/.server/auth/requireProjectId";
import { requireParam } from "~/.server/utils/requireParam";
import { prisma } from "~/lib/prisma";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { APIError, type ApiResponse } from "~/types/api";
import type { Route } from "../+types/root";

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const projectPublicIdParam = requireParam({ key: "id", params });

    const { projectId } = await requireProjectId({ request });

    const project = await prisma.project.findUniqueOrThrow({
      where: {
        id: projectId,
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

    return data<ApiResponse>({
      errorMessage: "",
      successMessage: "This worked",
      ok: true,
      data: project,
    });
  } catch (error: unknown) {
    console.error("api error: ", error);
    return data<ApiResponse>(
      {
        errorMessage:
          (error as APIError).message ?? INTENTIONALLY_GENERIC_ERROR_MESSAGE,
        ok: false,
        data: null,
      },
      (error as APIError).statusCode ?? 500,
    );
  }
}
