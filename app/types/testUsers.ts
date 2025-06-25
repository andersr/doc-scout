/**
 * Will be turned into email addressess and should be all lowercase
 */
// const baseTestUserNames = ["has_docs", "no_docs"] as const;

// const envTestUserNames = baseTestUserNames.map(
//   (u) => `${u}_${process.env.CI ? "ci" : "dev"}`,
// );

export const TestUserNames = ["has_docs", "no_docs"] as const;

export type CreateTestUserInput = { email: string };
// export type DbTestUserInput = Pick<User, "stytchId" | "username">;

const keyTuples = TestUserNames.map((k) => [k, k]);

export type TestUserNames = (typeof TestUserNames)[number];
export const TEST_USERS: Record<TestUserNames, TestUserNames> =
  Object.fromEntries(keyTuples);

// export const getUsername = (username: TestUserNames) =>
//   `${username}_${process.env.CI ? "ci" : "dev"}`;
