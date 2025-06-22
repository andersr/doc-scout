import { test } from "@playwright/test";

test.describe("User Menu", () => {
  test.skip(`displays current user's email address`, async ({ page }) => {
    // click on user menu
    // expect to see email address
  });

  test.skip(`signs out a user if clicking sign out`, async ({ page }) => {
    // click on user menu
    // click sign out
    // expect to see login page
  });
});
