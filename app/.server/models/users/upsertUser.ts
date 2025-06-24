import type { User } from "@prisma/client";
import { generateId } from "~/.server/utils/generateId";
import { prisma } from "~/lib/prisma";

export async function upsertUser({
  email,
  stytchId,
}: Pick<User, "stytchId"> & { email: string }) {
  await prisma.user.upsert({
    create: {
      email,
      publicId: generateId(),
      stytchId,
    },
    update: {
      // email,
    },
    where: {
      stytchId,
    },
  });
}
