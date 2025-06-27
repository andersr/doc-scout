import type { Prisma, User } from "@prisma/client";

export const USER_INTERNAL_INCLUDE = {
  messages: true,
  sources: true,
} as const;

export type UserInternal = Prisma.UserGetPayload<{
  include: typeof USER_INTERNAL_INCLUDE;
}>;

export type UserClient = Pick<User, "publicId"> & {
  email: string;
};
