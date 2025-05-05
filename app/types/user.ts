import type { Prisma } from "@prisma/client";

// TODO: unused?
export type UserWithRelations = Prisma.UserGetPayload<{
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

// TODO: add client only project and source data
// export type UserClient = Pick<UserWithRelations, "email" | "publicId">;
