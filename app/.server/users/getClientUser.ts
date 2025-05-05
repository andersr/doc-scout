import { prisma } from "~/lib/prisma";
import type { DataRequest } from "~/types/dataRequest";
import { logout } from "../sessions/logout";
import { getUserPublicId } from "./getUserPublicId";

export async function getClientUser({ request, require }: DataRequest) {
  const publicId = await getUserPublicId({ request, require });

  const user = await prisma.user.findUnique({
    where: {
      publicId: publicId ?? "",
    },
    select: {
      email: true,
      publicId: true,
      projectMemberships: {
        select: {
          project: {
            select: {
              name: true,
              publicId: true,
              sources: {
                select: {
                  name: true,
                  url: true,
                  publicId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (require && !user) {
    throw await logout({ request });
  }

  return user;
}
