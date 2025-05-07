import { prisma } from "~/lib/prisma";
import { logout } from "../sessions/logout";
import { getUserPublicId } from "./getUserPublicId";

export async function requireUser({ request }: { request: Request }) {
  const publicId = await getUserPublicId({ request });

  if (!publicId) {
    throw await logout({ request });
  }

  const user = await prisma.user.findUnique({
    where: {
      publicId: publicId ?? "",
    },
    include: {
      projectMemberships: {
        include: {
          project: {
            select: {
              id: true,
              publicId: true,
              name: true,
              collectionName: true,
              sources: true,
              apiKeys: {
                select: {
                  id: true,
                  name: true,
                  createdAt: true,
                },
              },
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
