import { upsertUser } from "@app/.server/models/users/upsertUser";
import type { TestUserNames } from "@e2e/types/testUsers";
import { getTestEmail } from "./getTestEmail";
import { upsertStytchUser } from "./upsertStytchUser";

export async function upsertTestUser(userName: TestUserNames) {
  const stytchId = await upsertStytchUser({ email: getTestEmail(userName) });

  await upsertUser({ stytchId });
}
