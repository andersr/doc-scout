/**
 * Used for setting input ids, query params, and other values that need to match across separate methods and services, ie between client and server.
 */
export const AppKeys = [
  "description",
  "id",
  "ids",
  "email",
  "error",
  "files",
  "fileNames",
  "sourcesInput",
  "message",
  "intent",
  "username",
  "urls",
  "password",
  "token",
] as const;

const keyTuples = AppKeys.map((k) => [k, k]);

export type AppKeys = (typeof AppKeys)[number];
export const KEYS: Record<AppKeys, AppKeys> = Object.fromEntries(keyTuples);
