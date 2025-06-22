import { stytchClient } from "../../app/.server/vendors/stytch/client";
import { type CreateTestUserInput } from "../../app/__test__/users";

export async function upsertStytchUser(
  user: CreateTestUserInput,
): Promise<string> {
  try {
    let stytchUserId = "";
    const searchRes = await stytchClient.users.search({
      cursor: "",
      limit: 1,
      query: {
        operands: [
          {
            filter_name: "email_address",
            filter_value: [user.email],
          },
        ],
        operator: "AND",
      },
    });

    stytchUserId =
      searchRes.results.length > 0 ? searchRes.results[0].user_id : "";

    if (!stytchUserId) {
      const userRes = await stytchClient.passwords.create(user);

      stytchUserId = userRes.user_id;
    }

    return stytchUserId;
  } catch (error) {
    console.error("error: ", error);
    throw new Error("error upserting stytch user");
  }
}
