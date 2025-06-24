import type { User } from "@prisma/client";
import { prisma } from "~/lib/prisma";

export async function upsertUser({
  email,
  stytchId,
}: Pick<User, "stytchId"> & { email: string }) {
  const stytchUser = await prisma.user.findUnique({
    where: {
      stytchId,
    },
  });
  console.info("stytchUser: ", stytchUser);

  const emailUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  console.info("emailUser: ", emailUser);

  // await prisma.user.upsert({
  //   create: {
  //     email,
  //     publicId: generateId(),
  //     stytchId,
  //   },
  //   update: {},
  //   where: {
  //     email,
  //     stytchId,
  //   },
  // });
}
