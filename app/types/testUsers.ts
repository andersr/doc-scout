import type { User } from "@prisma/client";

export const TestUserNames = ["hasDocs", "hasDocCreateChat", "noDocs"] as const;

export type CreateTestUserInput = { email: string; password: string };
export type DbTestUserInput = Pick<User, "stytchId" | "username">;

const keyTuples = TestUserNames.map((k) => [k, k]);

export type TestUserNames = (typeof TestUserNames)[number];
export const TEST_USERS: Record<TestUserNames, TestUserNames> =
  Object.fromEntries(keyTuples);
