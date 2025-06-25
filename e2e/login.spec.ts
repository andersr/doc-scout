import { expect, test } from "@playwright/test";
import { appRoutes } from "~/shared/appRoutes";

test.describe("Login", () => {
  test.skip(`redirects unauthorized users to request access page`, async ({
    page,
  }) => {
    // act
    await page.goto(appRoutes("/login"));
    await page.getByRole("textbox", { name: "Email" }).fill("foo@bar.com");
    await page.getByRole("button", { name: "Continue" }).click();

    // assert
    await expect(
      page.getByRole("heading", { name: "Please Request Access" }),
    ).toBeVisible();
  });
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
