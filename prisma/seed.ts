const prisma = new PrismaClient();

import { PrismaClient } from "@prisma/client";
import { ENV_TEST } from "~/.server/ENV";

import { stytchClient } from "~/.server/stytch/client";
import { generateId } from "~/.server/utils/generateId";

type TestUser = { email: string; password: string };
type DbUser = { email: string; stytchId: string };

async function seed() {
  if (!process.env.TEST_ENV) {
    throw new Error("not a test env");
  }

  const usersString = ENV_TEST.TEST_USERS;
  if (!usersString) {
    throw new Error("no test users env var found");
  }

  const users = getTestUsers(usersString);

  const dbUsers: DbUser[] = [];

  for await (const user of users) {
    const dbUser = await upsertStytchUser(user);
    dbUsers.push(dbUser);
  }

  for await (const user of dbUsers) {
    await prisma.user.upsert({
      create: {
        publicId: generateId(),
        stytchId: user.stytchId,
        username: user.email,
      },
      update: {
        stytchId: user.stytchId,
      },
      where: {
        username: user.email,
      },
    });
  }
  console.info("db users upserted");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function getTestUsers(usersString: string) {
  const emailPasswords = usersString.split(",");
  if (emailPasswords.length === 0) {
    throw new Error("no test user strings found");
  }
  const users: TestUser[] = [];
  emailPasswords.forEach((ep) => {
    const parts = ep.split("|");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error("no test users found");
    }

    users.push({
      email: parts[0],
      password: parts[1],
    });
  });

  return users;
}

async function upsertStytchUser(user: TestUser): Promise<DbUser> {
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

    return {
      email: user.email,
      stytchId: stytchUserId,
    };
  } catch (error) {
    console.error("error: ", error);
    throw new Error("error upserting stytch user");
  }
}
