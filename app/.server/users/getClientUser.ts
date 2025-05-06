import { prisma } from "~/lib/prisma";

export async function getClientUser({ publicId }: { publicId: string }) {
  return await prisma.user.findUnique({
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
}
