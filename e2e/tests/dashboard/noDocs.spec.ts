import { appRoutes } from "@app/shared/appRoutes";
import { TEST_USERS } from "@e2e/types/testUsers";
import { setAuthStoragePath } from "@e2e/utils/setAuthStoragePath";
import { expect, test } from "@playwright/test";

test.describe("Dashboard - No Docs", () => {
  test.use({ storageState: setAuthStoragePath(TEST_USERS.no_docs) });
  test("redirects to New Docs if user has no docs", async ({ page }) => {
    await page.goto(appRoutes("/docs/new"));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Add Docs/,
    );
  });
});
