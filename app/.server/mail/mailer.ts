import nodemailer from "nodemailer";
import { ENV } from "../ENV";

export const mailer = nodemailer.createTransport({
  auth: {
    pass: ENV.SMTP_KEY,
    user: ENV.SMTP_USER,
  },
  host: ENV.SMTP_SERVER,
  port: Number(ENV.SMTP_PORT),
});
