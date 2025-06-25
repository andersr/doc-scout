import type { TestUserNames } from "~/types/testUsers";

const isCI = process.env.CI;
const TEST_DOMAIN = "test.com";

export const getTestEmail = (username: TestUserNames) => {
  return `${username}-${isCI ? "ci" : "dev"}@${TEST_DOMAIN}`;
};
