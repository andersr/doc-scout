import type { User } from "@prisma/client";
import { generateId } from "~/.server/utils/generateId";
import { prisma } from "~/lib/prisma";
// & { email: string }
export async function upsertUser({ stytchId }: Pick<User, "stytchId">) {
  await prisma.user.upsert({
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
