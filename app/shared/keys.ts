/**
 * Used for setting input ids, query params, and other values that need to match across separate methods and services, ie between client and server.
 */
const KEY_VALUES = [
  "id",
  "ids",
  "email",
  "error",
  "files",
  "message",
  "intent",
  "urls",
] as const;

const keyTuples = KEY_VALUES.map((k) => [k, k]);

export type AppKeys = (typeof KEY_VALUES)[number];
export const KEYS: Record<AppKeys, AppKeys> = Object.fromEntries(keyTuples);
