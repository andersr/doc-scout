import {
  CreateTestUserInput,
  getTestEmail,
  TEST_USER_PWD,
} from "../../app/__test__/users";
import { prisma } from "../../app/lib/prisma";
import { generateTestId } from "./generateTestId";
import { upsertStytchUser } from "./upsertStytchUser";

export async function upsertTestUsers(userNames: readonly string[]) {
  for await (const userName of userNames) {
    await upsertTestUser(userName);
  }
}

export async function upsertTestUser(userName: string) {
  const user: CreateTestUserInput = {
    email: getTestEmail(userName),
    password: TEST_USER_PWD,
  };
  const stytchId = await upsertStytchUser(user);

  await prisma.user.upsert({
    create: {
      publicId: generateTestId(),
      stytchId,
      username: user.email,
    },
    update: {},
    where: {
      stytchId,
    },
  });
}
