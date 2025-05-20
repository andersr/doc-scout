import type { User } from "@prisma/client";
import { prisma } from "~/lib/prisma";
import { generateId } from "../utils/generateId";

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
