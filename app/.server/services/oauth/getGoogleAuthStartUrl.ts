import { ENV } from "~/.server/ENV";
import { GOOGLE_DRIVE_SCOPES } from "~/config/google";
import { KEYS } from "../../../shared/keys";

export default function (): string {
  // see: https://vercel.com/docs/environment-variables/system-environment-variables
  const vercelEnv = process.env.VERCEL_ENV;
  const previewHost = process.env.VERCEL_URL;

  // see: https://stytch.com/docs/workspace-management/api-keys#environments
  const startUrl = `https://${vercelEnv === "production" ? "api" : "test"}.stytch.com/v1/public/oauth/google/start`;

  const url = new URL(startUrl);
  url.searchParams.set(KEYS.public_token, ENV.STYTCH_PUBLIC_TOKEN);

  url.searchParams.set(KEYS.custom_scopes, GOOGLE_DRIVE_SCOPES);

  if (vercelEnv === "preview" && previewHost) {
    const previewUrl = `https://${previewHost}`;
    const redirectUrl = `${previewUrl}/authenticate`;

    url.searchParams.set(KEYS.login_redirect_url, redirectUrl);
    url.searchParams.set(KEYS.signup_redirect_url, redirectUrl);
  }

  return url.href;
}
