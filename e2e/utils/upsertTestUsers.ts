import { upsertUser } from "~/.server/models/users/upsertUser";
import { TestUserNames } from "../../app/types/testUsers";
import { getTestEmail } from "./getTestEmail";
import { upsertStytchUser } from "./upsertStytchUser";

export async function upsertTestUser(userName: TestUserNames) {
  const stytchId = await upsertStytchUser({ email: getTestEmail(userName) });

  await upsertUser({ stytchId });
}
