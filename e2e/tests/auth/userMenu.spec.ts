import { expect, test } from "@playwright/test";
import { setAuthStoragePath } from "e2e/utils/setAuthStoragePath";
import { appRoutes } from "~/shared/appRoutes";
import { TEST_USERS } from "~/types/testUsers";

test.describe("User Menu", () => {
  test.use({ storageState: setAuthStoragePath(TEST_USERS.no_docs) });

  test.skip("displays current user's email address", async ({ page }) => {
    // click on user menu
    // expect to see email address
  });

  test("signs out a user if clicking sign out", async ({ page }) => {
    // act
    await page.goto(appRoutes("/"));
    await page.getByRole("button", { name: "no_docs@test.com" }).click();
    await page.getByRole("button", { name: "Sign Out" }).click();

    // assert
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });
});
