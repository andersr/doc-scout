import type { Prisma, User } from "@prisma/client";

type BaseTestUser = Prisma.UserGetPayload<{
  include: {
    sources: {
      select: {
        fileName: true;
        id: true;
        publicId: true;
        summary: true;
        text: true;
      };
    };
  };
}>;

export const TestUserNames = ["dashboardNoDocs", "dashboardHasDocs"] as const;

export type CreateTestUserInput = { email: string; password: string };
export type DbTestUserInput = Pick<User, "stytchId" | "username">;

const keyTuples = TestUserNames.map((k) => [k, k]);

export type TestUserNames = (typeof TestUserNames)[number];
export const TEST_USERS: Record<TestUserNames, TestUserNames> =
  Object.fromEntries(keyTuples);

type TestUserConfig = Pick<BaseTestUser, "sources">;

export const TEST_DOMAIN = "test.com";
export const TEST_USER_PWD = "3aad5ae9ac2f7c8b6242612f487d6208"; // for now

export const getTestEmail = (user: string) => `${user}@${TEST_DOMAIN}`;

export const TEST_USER_CONFIG: Record<TestUserNames, TestUserConfig> = {
  dashboardHasDocs: {
    sources: [],
  },
  dashboardNoDocs: {
    sources: [],
  },
};
