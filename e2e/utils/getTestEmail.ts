import type { TestUserNames } from "~/types/testUsers";

// TODO: move to common config
const TEST_DOMAIN = "test.com";

export const getTestEmail = (username: TestUserNames) => {
  return `${username}@${TEST_DOMAIN}`;
};
