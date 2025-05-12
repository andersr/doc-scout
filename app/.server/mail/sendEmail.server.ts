import type { EmailConfig } from "~/components/email/EmailTemplate";
import { renderEmail } from "~/components/email/EmailTemplate";
import { ENV } from "../ENV";
import { mailer } from "./mailer";

export async function sendEmail({
  to,
  config,
  fromEmail,
  fromName,
}: {
  to: string;
  fromEmail?: string;
  fromName?: string;
  config: EmailConfig;
}) {
  try {
    await mailer.sendMail({
      from:
        fromEmail && fromName
          ? `${fromName} <${fromEmail}>`
          : `Muni Admin <${ENV.SMTP_USER}>`,
      html: await renderEmail(config),
      sender: fromName || "Muni Admin",
      subject: config.title,
      to,
    });
  } catch (error) {
    console.error("error: ", error);

    throw new Error("Error sending notify email.");
  }
}
