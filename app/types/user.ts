import type { Prisma } from "@prisma/client";
import { PROJECT_SELECT_INTERNAL } from "./project";

export const USER_INCLUDE = {
  projectMemberships: {
    include: {
      project: {
        select: PROJECT_SELECT_INTERNAL,
      },
    },
  },
} as const;

// TODO: same as in requireUser
export type UserInternal = Prisma.UserGetPayload<{
  include: typeof USER_INCLUDE;
}>;

export type UserClient = Prisma.UserGetPayload<{
  select: {
    email: true;
    projectMemberships: {
      select: {
        project: {
          select: {
            name: true;
            publicId: true;
            sources: {
              select: {
                name: true;
                publicId: true;
                url: true;
              };
            };
          };
        };
      };
    };
    publicId: true;
  };
}>;
