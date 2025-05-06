import type { Prisma } from "@prisma/client";

// TODO: same select as in getClientUser
export type UserClient = Prisma.UserGetPayload<{
  select: {
    email: true;
    publicId: true;
    projectMemberships: {
      select: {
        project: {
          select: {
            name: true;
            publicId: true;
            sources: {
              select: {
                name: true;
                url: true;
                publicId: true;
              };
            };
          };
        };
      };
    };
  };
}>;
