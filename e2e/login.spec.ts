import { test } from "@playwright/test";

test.describe("Login", () => {
  test.skip(`allows for signing in with an email address`, async ({ page }) => {
    // ensure user is not auth
    // go to login
    // enter an email address and click login (or hit return)
    // expect to see success message
    // use mailosaurus to get sent email and click on link
    // expect to see dashboard
  });

  test.skip(`redirects to login if user is not signed in`, async ({ page }) => {
    // ensure user is not auth
    // go to dashboard
    // expect to see Login header
  });
});
