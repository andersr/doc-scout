import type { User } from "@prisma/client";
import { generateId } from "~/.server/utils/generateId";
import { prisma } from "~/lib/prisma";

export function upsertUser({ stytchId }: Pick<User, "stytchId">) {
  return prisma.user.upsert({
    create: {
      publicId: generateId(),
      stytchId,
    },
    update: {},
    where: {
      stytchId,
    },
  });
}
