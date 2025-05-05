import { prisma } from "~/lib/prisma";
import type { DataRequest } from "~/types/dataRequest";
import { logout } from "../sessions/logout";
import { getUserPublicId } from "./getUserPublicId";

export async function requireInternalUser({ request }: DataRequest) {
  const publicId = await getUserPublicId({ request });

  const user = await prisma.user.findUnique({
    where: {
      publicId: publicId ?? "",
    },
    include: {
      projectMemberships: {
        include: {
          project: {
            include: {
              sources: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw await logout({ request });
  }

  return user;
}
