import type { User } from "@prisma/client";
import { prisma } from "~/lib/prisma";
import { generateId } from "../utils/generateId";

export function createUser({
  email,
  name,
}: Pick<User, "email"> & Partial<Pick<User, "name">>) {
  return prisma.user.create({
    data: {
      createdAt: new Date(),
      email: email.trim().toLowerCase(),
      name,
      publicId: generateId(),
    },
  });
}
