const prisma = new PrismaClient();

import { PrismaClient } from "@prisma/client";

// import { TestUserNames } from "../app/__test__/users";
// import { upsertTestUsers } from "../e2e/utils/upsertTestUsers";

// const isTestEnv = process.env.E2E_ENV;

async function seed() {
  // if (isTestEnv) {
  //   if (!TestUserNames) {
  //     console.error("no test uernames found, cannot seed test users");
  //     return;
  //   }
  //   await upsertTestUsers(TestUserNames);
  // }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
