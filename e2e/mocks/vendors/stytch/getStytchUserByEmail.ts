import type { User as StytchUser } from "stytch";

export async function getStytchUserByEmail(
  email: string,
): Promise<StytchUser | undefined> {
  try {
    return {
      biometric_registrations: [],
      crypto_wallets: [],
      emails: [{ email, email_id: "foo", verified: false }],
      is_locked: false,
      phone_numbers: [],
      providers: [],
      status: "foo",
      totps: [],
      user_id: email,
      webauthn_registrations: [],
    };
  } catch (error) {
    console.error("getStytchUser error: ", error);
    return undefined;
  }
}
