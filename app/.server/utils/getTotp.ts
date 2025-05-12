import { generateTOTP } from "@epic-web/totp";

// import { generateSecret } from "./generateSecret.server";
import { TOTP_CHARSET, TOTP_EXPIRATION } from "~/config/totp";

export async function getTOTP() {
  // const { otp, ...verificationConfig } = generateTOTP({
  //   algorithm: "SHA256",
  //   charSet: totpCharset,
  //   period,
  //   secret: generateSecret(),
  // });
  const { otp, ...verificationConfig } = await generateTOTP({
    algorithm: "SHA-256", // more secure algorithm should be used with longer-lived OTPs
    period: TOTP_EXPIRATION,
    charSet: TOTP_CHARSET,
  });

  return {
    otp,
    verificationConfig,
  };
}
