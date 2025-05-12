import { verifyTOTP } from "@epic-web/totp";
import { getValidatedFormData } from "remix-hook-form";
import { otpResolver, type OtpFormData } from "~/components/OtpForm";
import { EMAIL_TARGET_TYPE, TOTP_CHARSET } from "~/config/totp";
import { prisma } from "~/lib/prisma";
import { createSession } from "../sessions/createSession";

export async function otpAction({ request }: { request: Request }) {
  const {
    errors,
    data: formData,
    receivedValues: defaultValues,
  } = await getValidatedFormData<OtpFormData>(request, otpResolver);

  if (errors) {
    return {
      errorMessage: "", // TODO: use either this or errors
      ok: false,
      defaultValues,
      errors,
      email: "",
    };
  }

  // TODO: wrap this or parent in try/catch if throwing
  const verification = await prisma.verification.findUniqueOrThrow({
    select: {
      algorithm: true,
      email: true,
      id: true,
      inviteId: true,
      period: true,
      secret: true,
      type: true,
    },
    where: {
      OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
      target_type: {
        target: formData.email,
        type: EMAIL_TARGET_TYPE,
      },
    },
  });

  const isValid = await verifyTOTP({
    algorithm: verification.algorithm,
    charSet: TOTP_CHARSET,
    otp: formData.otp,
    period: verification.period,
    secret: verification.secret,
  });

  await prisma.verification.delete({
    where: {
      id: verification.id,
    },
  });

  if (!isValid) {
    //throw error
    // return {
    //   email: user.email,
    //   errorMessage: "",
    //   ok: true,
    // };
    throw new Error("Invalid or expired code. Please try again.");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: formData.email,
    },
  });

  return createSession({
    publicId: user.publicId,
    // redirectTo: redirectTo || route("/"),
    remember: true,
    request,
  });
}
