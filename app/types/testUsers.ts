/**
 * Will be turned into email addressess and should be all lowercase
 * Each env should have its own instance of test users
 */
export const TestUserNames = [
  "has_docs",
  "new_docs_redirect",
  "no_docs",
] as const;

export type CreateTestUserInput = { email: string };

const keyTuples = TestUserNames.map((k) => [k, k]);

export type TestUserNames = (typeof TestUserNames)[number];
export const TEST_USERS: Record<TestUserNames, TestUserNames> =
  Object.fromEntries(keyTuples);
