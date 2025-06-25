import type { User as StytchUser } from "stytch";
import { stytchClient } from "./client";

export async function getStytchUserById(
  stytchId: string,
): Promise<StytchUser | undefined> {
  try {
    return await stytchClient.users.get({
      user_id: stytchId,
    });
  } catch (error) {
    console.error("getStytchUser error: ", error);
    return undefined;
  }
}
