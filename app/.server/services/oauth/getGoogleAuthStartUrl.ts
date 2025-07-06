import { ENV } from "~/.server/ENV";
import { GOOGLE_DRIVE_SCOPES } from "~/config/google";
import { STYTCH_GOOGLE_START } from "~/config/stytch";
import { KEYS } from "../../../shared/keys";

export default function (): string {
  const vercelEnv = process.env.VERCEL_ENV;
  const previewHost = process.env.VERCEL_URL;

  const stytchGoogleAuthStart = new URL(STYTCH_GOOGLE_START);
  stytchGoogleAuthStart.searchParams.set(
    KEYS.public_token,
    ENV.STYTCH_PUBLIC_TOKEN,
  );
  stytchGoogleAuthStart.searchParams.set(
    KEYS.custom_scopes,
    GOOGLE_DRIVE_SCOPES,
  );

  if (vercelEnv === "preview" && previewHost) {
    const previewUrl = `https://${previewHost}`;
    const redirectUrl = `${previewUrl}/authenticate`;

    stytchGoogleAuthStart.searchParams.set(
      KEYS.login_redirect_url,
      redirectUrl,
    );
    stytchGoogleAuthStart.searchParams.set(
      KEYS.signup_redirect_url,
      redirectUrl,
    );
  }

  return stytchGoogleAuthStart.href;
}
