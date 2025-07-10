/**
 * Used for setting input ids, query params, and other values that need to match across separate methods and services, ie between client and server.
 */
export const AppKeys = [
  "chat",
  "custom_scopes", // used for oauth
  "delete",
  "description",
  "email",
  "error",
  "files",
  "fileNames",
  "googleDrive",
  "id",
  "ids",
  "login_redirect_url", // used for stytch oauth
  "sourcesInput",
  "message",
  "intent",
  "username",
  "urls",
  "password",
  "public_token", // used for stytch oauth
  "signup_redirect_url", // used for stytch oauth
  "session_token",
  "access_token",
  "token",
] as const;

const keyTuples = AppKeys.map((k) => [k, k]);

export type AppKeys = (typeof AppKeys)[number];
export const KEYS: Record<AppKeys, AppKeys> = Object.fromEntries(keyTuples);
