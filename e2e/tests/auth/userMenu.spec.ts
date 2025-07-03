import { appRoutes } from "@app/shared/appRoutes";
import { TEST_USERS } from "@app/types/testUsers";
import { getTestEmail } from "@e2e/utils/getTestEmail";
import { setAuthStoragePath } from "@e2e/utils/setAuthStoragePath";
import { expect, test } from "@playwright/test";

test.describe("User Menu", () => {
  test.use({ storageState: setAuthStoragePath(TEST_USERS.no_docs) });

  const USER_EMAIL = getTestEmail(TEST_USERS.no_docs);

  test("displays current user's email address", async ({ page }) => {
    // act
    await page.goto(appRoutes("/"));
    await page.getByRole("button", { name: USER_EMAIL }).click();

    // assert
    await expect(page.getByText(USER_EMAIL)).toBeVisible();
  });

  test("signs out a user if clicking sign out", async ({ page }) => {
    // act
    await page.goto(appRoutes("/"));
    await page.getByRole("button", { name: USER_EMAIL }).click();
    await page.getByRole("button", { name: "Sign Out" }).click();

    // assert
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });
});
