import type { User } from "@prisma-app/client";
import type { UserClient } from "~/types/user";

export function getClientUser(user: User): UserClient {
  return {
    email: user.email,
    publicId: user.publicId,
  };
}
