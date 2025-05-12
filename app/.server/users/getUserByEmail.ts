import type { User } from "@prisma/client";
import { prisma } from "~/lib/prisma";

export function getUserByEmail({ email }: Pick<User, "email">) {
  return prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
  });
}
