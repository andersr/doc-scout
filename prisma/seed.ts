const prisma = new PrismaClient();

import { PrismaClient } from "@prisma/client";

// import { z } from "zod";
import { stytchClient } from "../app/.server/vendors/stytch/client";
import {
  CreateTestUserInput,
  getTestEmail,
  TEST_USER_PWD,
  TestUserNames,
} from "../app/__test__/users";
import { generateTestId } from "../e2e/utils/generateTestId";

const isTestEnv = process.env.TEST_ENV;

async function seed() {
  if (isTestEnv) {
    if (!TestUserNames) {
      console.error("no test uernames found, cannot seed test users");
      return;
    }
    await upsertTestUsers(TestUserNames);
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

async function upsertTestUsers(userNames: readonly string[]) {
  for await (const userName of userNames) {
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
}

async function upsertStytchUser(user: CreateTestUserInput): Promise<string> {
  try {
    let stytchUserId = "";
    const searchRes = await stytchClient.users.search({
      cursor: "",
      limit: 1,
      query: {
        operands: [
          {
            filter_name: "email_address",
            filter_value: [user.email],
          },
        ],
        operator: "AND",
      },
    });

    stytchUserId =
      searchRes.results.length > 0 ? searchRes.results[0].user_id : "";

    if (!stytchUserId) {
      const userRes = await stytchClient.passwords.create(user);

      stytchUserId = userRes.user_id;
    }

    return stytchUserId;
  } catch (error) {
    console.error("error: ", error);
    throw new Error("error upserting stytch user");
  }
}
