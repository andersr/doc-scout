import { expect, test } from "@playwright/test";

import { appRoutes } from "../../../app/shared/appRoutes";
import { TEST_USERS } from "../../../app/types/testUsers";
import { setAuthStoragePath } from "../../utils/setAuthStoragePath";

test.describe("Dashboard - No Docs", () => {
  test.use({ storageState: setAuthStoragePath(TEST_USERS.no_docs) });
  test("redirects to New Docs if user has no docs", async ({ page }) => {
    await page.goto(appRoutes("/"));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Add Docs/,
    );
  });
});
