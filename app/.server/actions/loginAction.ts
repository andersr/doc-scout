import { getValidatedFormData } from "remix-hook-form";
import { type LoginFormData, loginResolver } from "~/components/LoginForm";
import { EMAIL_TARGET_TYPE } from "~/config/totp";
import { prisma } from "~/lib/prisma";
import { sendEmail } from "../mail/sendEmail.server";
import { upsertUser } from "../users/upsertUser";
import { getDomainHost } from "../utils/getDomainHost";
import { getTOTP } from "../utils/getTotp";

export async function loginAction({ request }: { request: Request }) {
  const {
    errors,
    data: formData,
    receivedValues: defaultValues,
  } = await getValidatedFormData<LoginFormData>(request, loginResolver);

  if (errors) {
    return {
      email: "",
      errorMessage: "", // TODO: use either this or errors
      ok: false,
      defaultValues,
      errors,
    };
  }

  const { user, newUser } = await upsertUser({ email: formData.email });

  const { otp, verificationConfig } = await getTOTP();

  const target = user.email;

  const verificationData = {
    algorithm: verificationConfig.algorithm,
    digits: verificationConfig.digits,
    email: user.email,
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
    period: verificationConfig.period,
    secret: verificationConfig.secret,
    target,
    type: EMAIL_TARGET_TYPE,
  };

  await prisma.verification.upsert({
    create: verificationData,
    update: verificationData,
    where: { target_type: { target, type: EMAIL_TARGET_TYPE } },
  });

  const emailGreeting = newUser ? "Welcome to" : "Sign in to";
  const domainHost = getDomainHost({ request });

  const title = `${emailGreeting} Muni Admin (${domainHost})`;

  await sendEmail({
    config: {
      textLines: [
        `Your OTP: ${otp}`,
        "If you did not request this email, you can safely ignore it.",
      ],
      title,
    },
    to: user.email,
  });

  return {
    email: user.email,
    errorMessage: "",
    ok: true,
  };
}
