import { upsertUser } from "~/.server/models/users/upsertUser";
import { type CreateTestUserInput } from "../../app/types/testUsers";
import { getTestEmail } from "./getTestEmail";
import { upsertStytchUser } from "./upsertStytchUser";

const testUserPwd: string = process.env.TEST_USER_PWD ?? "";

export async function upsertTestUsers(userNames: readonly string[]) {
  if (testUserPwd === "") {
    throw new Error("No test user password");
  }

  for await (const userName of userNames) {
    await upsertTestUser(userName);
  }
}

export async function upsertTestUser(userName: string) {
  const user: CreateTestUserInput = {
    email: getTestEmail(userName),
    password: testUserPwd as string,
  };
  const stytchId = await upsertStytchUser(user);

  await upsertUser({ email: user.email, stytchId });
}
