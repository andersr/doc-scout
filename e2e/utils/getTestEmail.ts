import type { TestUserNames } from "@e2e/types/testUsers";

export const getTestEmail = (username: TestUserNames) => {
  return `${username}@test.com`;
};
