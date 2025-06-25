import type { User as StytchUser } from "stytch";
import { stytchClient } from "../../vendors/stytch/client";

export async function getStytchUser({
  email,
  stytchId,
}: {
  email?: string;
  stytchId?: string;
}): Promise<StytchUser | undefined> {
  try {
    if (stytchId) {
      return await stytchClient.users.get({
        user_id: stytchId,
      });
    }

    const searchRes = await stytchClient.users.search({
      cursor: "",
      limit: 2,
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
