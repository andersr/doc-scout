import { AUTH_SESSION_DURATION, AUTH_SESSION_NAME } from "~/config/auth";
import { ENV } from "../ENV";
import { createSessionStore } from "./createSessionStore";

export const authSessionStore = createSessionStore({
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  maxAge: AUTH_SESSION_DURATION,
  name: AUTH_SESSION_NAME,
  secrets: [ENV.AUTH_SESSION_SECRET],
  secure: process.env.NODE_ENV === "production",
});
