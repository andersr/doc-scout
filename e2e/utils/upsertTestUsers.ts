import { upsertUser } from "~/.server/models/users/upsertUser";
import { TestUserNames } from "../../app/types/testUsers";
import { getTestEmail } from "./getTestEmail";
import { upsertStytchUser } from "./upsertStytchUser";

// const testUserPwd: string = process.env.TEST_USER_PWD ?? "";

// export async function upsertTestUsers(userNames: TestUserNames[]) {
//   // if (testUserPwd === "") {
//   //   throw new Error("No test user password");
//   // }

//   for await (const userName of userNames) {
//     const stytchId = await upsertStytchUser({ email: getTestEmail(userName) });

//     await upsertUser({ stytchId });
//   }
// }

export async function upsertTestUser(userName: TestUserNames) {
  const stytchId = await upsertStytchUser({ email: getTestEmail(userName) });

  await upsertUser({ stytchId });
}
