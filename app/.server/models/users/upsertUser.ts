import type { User } from "@prisma/client";
import { generateId } from "~/.server/utils/generateId";
import { prisma } from "~/lib/prisma";

export async function upsertUser({ stytchId }: Pick<User, "stytchId">) {
  return await prisma.user.upsert({
    create: {
      publicId: generateId(),
      stytchId,
    },
    include: {
      sources: true,
    },
    update: {},
    where: {
      stytchId,
    },
  });
}
