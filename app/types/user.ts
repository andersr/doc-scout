import type { Prisma } from "@prisma/client";

// TODO: same as in requireUser
export type UserInternal = Prisma.UserGetPayload<{
  include: {
    projectMemberships: {
      include: {
        project: {
          include: {
            sources: true;
          };
        };
      };
    };
  };
}>;

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
