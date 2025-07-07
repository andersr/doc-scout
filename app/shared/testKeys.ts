export const TestKeys = [
  "command",
  "upsertDoc",
  "username",
  "deleteMessages",
  "deleteSource",
  "deleteAllUserSources",
  "deleteSourcesByName",
  "chatPublicId",
  "sourcePublicId",
  "testId", // unused?
] as const;

const keyTuples = TestKeys.map((k) => [k, k]);

export type TestKeys = (typeof TestKeys)[number];
export const TEST_KEYS: Record<TestKeys, TestKeys> =
  Object.fromEntries(keyTuples);
