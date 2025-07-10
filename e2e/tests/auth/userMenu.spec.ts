import { appRoutes } from "@app/shared/appRoutes";
import { TEST_USERS } from "@e2e/types/testUsers";
import { getTestEmail } from "@e2e/utils/getTestEmail";
import { setAuthStoragePath } from "@e2e/utils/setAuthStoragePath";
import { expect, test } from "@playwright/test";

test.describe("User Menu - display email", () => {
  const username = TEST_USERS.user_menu_display_email;
  test.describe.configure({ retries: 2 });
  test.use({
    storageState: setAuthStoragePath(username),
  });

  const USER_EMAIL = getTestEmail(username);

  test("displays current user's email address", async ({ page }) => {
    // act
    await page.goto(appRoutes("/"));
    await page.getByRole("button", { name: USER_EMAIL }).click();

    // assert
    await expect(page.getByText(USER_EMAIL)).toBeVisible();
  });
});

test.describe("User Menu - sign out", () => {
  const username = TEST_USERS.user_menu_sign_out;

  test.describe.configure({ retries: 2 });
  test.use({ storageState: setAuthStoragePath(username) });

  const USER_EMAIL = getTestEmail(username);

  test("signs out a user if clicking sign out", async ({ page }) => {
    // act
    await page.goto(appRoutes("/"));
    await page.getByRole("button", { name: USER_EMAIL }).click();
    await page.getByRole("button", { name: "Sign Out" }).click();

    // assert
    await expect(
      page.getByRole("heading", { level: 1, name: "Doc Scout" }),
    ).toBeVisible();
  });
});
