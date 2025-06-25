import type { User as StytchUser } from "stytch";
import { stytchClient } from "./client";

export async function getStytchUserByEmail(
  email: string,
): Promise<StytchUser | undefined> {
  try {
    const searchRes = await stytchClient.users.search({
      cursor: "",
      query: {
        operands: [
          {
            filter_name: "email_address",
            filter_value: [email],
          },
        ],
        operator: "AND",
      },
    });

    if (searchRes.results.length > 1) {
      throw new Error(`Multiple matches found for ${email} in stytch search.`);
    }

    return searchRes.results.length === 1 ? searchRes.results[0] : undefined;
  } catch (error) {
    console.error("getStytchUser error: ", error);
    return undefined;
  }
}
