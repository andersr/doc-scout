import { requireEnvVar } from "@app/.server/utils/requireEnvVar";
import { stytchClient } from "@app/.server/vendors/stytch/client";
import { getStytchUserByEmail } from "@app/.server/vendors/stytch/getStytchUserByEmail";
import type { CreateTestUserInput } from "@e2e/types/testUsers";

export async function upsertStytchUser(
  user: CreateTestUserInput,
): Promise<string> {
  try {
    let stytchUserId = "";

    const stytchUser = await getStytchUserByEmail(user.email);

    stytchUserId = stytchUser ? stytchUser.user_id : "";

    if (!stytchUserId) {
      const userRes = await stytchClient.passwords.create({
        email: user.email,
        password: requireEnvVar("TEST_USER_PWD"),
      });

      stytchUserId = userRes.user_id;
    }

    return stytchUserId;
  } catch (error) {
    console.error("upsertStytchUser error: ", error);
    throw new Error("error upserting stytch user");
  }
}
