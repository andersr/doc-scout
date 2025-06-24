import type { User } from "@prisma/client";
import { generateId } from "~/.server/utils/generateId";
import { prisma } from "~/lib/prisma";

export async function upsertUser({
  email,
  stytchId,
}: Pick<User, "stytchId"> & { email: string }) {
  const existingUser = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
      stytchId,
    },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email,
        publicId: generateId(),
        stytchId,
      },
    });
  }
}
