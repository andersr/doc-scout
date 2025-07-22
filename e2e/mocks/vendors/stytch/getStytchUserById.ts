import type { User as StytchUser } from "stytch";

export async function getStytchUserById(
  stytchId: string,
): Promise<StytchUser | undefined> {
  try {
    return {
      biometric_registrations: [],
      crypto_wallets: [],
      emails: [{ email: stytchId, email_id: "foo", verified: false }],
      is_locked: false,
      phone_numbers: [],
      providers: [],
      status: "foo",
      totps: [],
      user_id: stytchId,
      webauthn_registrations: [],
    };
  } catch (error) {
    console.error("getStytchUser error: ", error);
    return undefined;
  }
}
