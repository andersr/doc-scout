import { ENV } from "~/.server/ENV";
import { createSessionStore } from "~/.server/sessions/createSessionStore";
import { AUTH_SESSION_DURATION, AUTH_SESSION_NAME } from "~/config/auth";

export const authSessionStore = createSessionStore({
  httpOnly: true,
  maxAge: AUTH_SESSION_DURATION,
  name: AUTH_SESSION_NAME,
  path: "/",
  sameSite: "lax",
  secrets: [ENV.AUTH_SESSION_SECRET],
  secure: process.env.NODE_ENV === "production",
});
