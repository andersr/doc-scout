import type { User } from "@prisma/client";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { generateId } from "~/.server/utils/generateId";
import { prisma } from "~/lib/prisma";
import { ServerError } from "~/types/server";

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
    },
  });

  if (existingUser && existingUser?.stytchId !== stytchId) {
    console.warn(
      `Existing Stytch id for user ${email} does not match incoming stytch id.`,
    );
    throw new ServerError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
  }

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
