import type { TestUserNames } from "~/types/testUsers";

const TEST_DOMAIN = "test.com";

export const getTestEmail = (username: TestUserNames) => {
  return `${username}@${TEST_DOMAIN}`;
};
