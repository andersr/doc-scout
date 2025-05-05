import type { User } from "@prisma/client";
import { prisma } from "~/lib/prisma";
import { generateId } from "../utils/generateId";

export function upsertUser({
  email,
  name,
}: Pick<User, "email"> & Partial<Pick<User, "name">>) {
  const emailNormalized = email.trim().toLowerCase();
  const now = new Date();

  return prisma.user.upsert({
    create: {
      createdAt: now,
      email: emailNormalized,
      name,
      publicId: generateId(),
    },
    update: {
      name,
    },
    where: {
      email: emailNormalized,
    },
  });
}
