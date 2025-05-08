import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { API_KEY_HEADER, ID_SECRET_DIVIDER } from "~/config/auth";
import { prisma } from "~/lib/prisma";
import { APIError } from "~/types/api";
import { verifyHash } from "../utils/hashUtils";

export async function requireProjectId({
  request,
}: {
  request: Request;
}): Promise<{ projectId: number }> {
  const apiKey = request.headers.get(API_KEY_HEADER);

  if (!apiKey) {
    throw new APIError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
  }
  const parts = apiKey?.split(ID_SECRET_DIVIDER) ?? [];

  if (parts.length !== 2) {
    throw new APIError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
  }

  const key = await prisma.key.findUnique({
    where: {
      id: parts[0] ?? "",
    },
    include: {
      project: true,
    },
  });

  if (!key) {
    throw new APIError(ReasonPhrases.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
  }

  const isValid = await verifyHash(key.secret, parts[1] ?? "");

  if (!isValid) {
    throw new APIError(ReasonPhrases.FORBIDDEN, StatusCodes.FORBIDDEN);
  }

  if (!key.project?.id) {
    throw new APIError(
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  return { projectId: key.project?.id };
}
