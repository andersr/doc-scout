import type { User } from "@prisma/client";

export const TestUserNames = ["hasDocs", "hasDocCreateChat", "noDocs"] as const;

export type CreateTestUserInput = { email: string; password: string };
export type DbTestUserInput = Pick<User, "stytchId" | "username">;

const keyTuples = TestUserNames.map((k) => [k, k]);

export type TestUserNames = (typeof TestUserNames)[number];
export const TEST_USERS: Record<TestUserNames, TestUserNames> =
  Object.fromEntries(keyTuples);

export const TEST_DOMAIN = "test.com";
export const TEST_USER_PWD = "3aad5ae9ac2f7c8b6242612f487d6208"; // for now

export const getTestEmail = (user: string) => `${user}@${TEST_DOMAIN}`;
