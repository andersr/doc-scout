import { expect, test } from "@playwright/test";

import { DASHBOARD_TITLE } from "@app/config/titles";

import type { UpsertSourceInput } from "@app/routes/e2e.$command/utils/e2eSchemas";
import { appRoutes } from "@app/shared/appRoutes";
import { TEST_KEYS } from "@app/shared/testKeys";
import { MOCK_SOURCE } from "@e2e/mocks/sources/mockSource";
import { TEST_USERS } from "@e2e/types/testUsers";
import { getTestEmail } from "@e2e/utils/getTestEmail";
import { setAuthStoragePath } from "@e2e/utils/setAuthStoragePath";

test.describe("Homepage - Has Docs", () => {
  const user = TEST_USERS.dashboard_has_docs;
  const sourcePublicId = "docsDashboardHasDocs";
  test.use({ storageState: setAuthStoragePath(user) });

  test("displays the homepage with docs", async ({ page, request }) => {
    // arrange
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.upsertDoc,
      }),
      {
        form: {
          email: getTestEmail(user),
          sourcePublicId,
        } satisfies UpsertSourceInput,
      },
    );
    // act
    await page.goto(appRoutes("/"));

    // assert
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      DASHBOARD_TITLE,
    );
    await expect(
      page.getByRole("link", { exact: false, name: MOCK_SOURCE.title }),
    ).toBeVisible();
  });
});
