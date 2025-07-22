import { upsertUser } from "@app/.server/models/users/upsertUser";
import type { TestUserNames } from "@e2e/types/testUsers";
import { getTestEmail } from "./getTestEmail";

export async function upsertTestUser(userName: TestUserNames) {
  await upsertUser({ stytchId: getTestEmail(userName) });
}
