import { expect, test } from "@playwright/test";

import { TEST_USERS } from "@e2e/types/testUsers";
import { setAuthStoragePath } from "@e2e/utils/setAuthStoragePath";

test.describe("No Docs", () => {
  test.use({ storageState: setAuthStoragePath(TEST_USERS.dashboard_no_docs) });

  // TODO: add an e2e login that matches actual user redirect on login to allow for testing this
  test.fixme(
    "redirects to Add Docs page on login if user has no docs",
    async ({ page }) => {
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        /Add Docs/,
      );
    },
  );
});
