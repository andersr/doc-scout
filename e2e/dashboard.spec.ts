import { expect, test } from "@playwright/test";

import { appRoutes } from "../app/shared/appRoutes";
import { TEST_KEYS } from "../app/shared/testKeys";
import type { TestActionRequest } from "../app/types/testActions";
import { TEST_USERS } from "../app/types/testUsers";
import { getTestEmail } from "./utils/getTestEmail";
import { setAuthStoragePath } from "./utils/setAuthStoragePath";

test.describe("Dashboard - No Docs", () => {
  test.use({ storageState: setAuthStoragePath(TEST_USERS.noDocs) });
  test(`redirects to New Docs if user ${TEST_USERS.noDocs} has NO docs`, async ({
    page,
  }) => {
    await page.goto(appRoutes("/"));
    await expect(page.getByRole("heading")).toHaveText(/Add Docs/);
  });
});

test.describe("Dashboard - Has Docs", () => {
  const user = TEST_USERS.hasDocs;
  const sourcePublicId = "docsDashboardHasDocs";
  test.use({ storageState: setAuthStoragePath(user) });

  test(`redirects to the dashboard if user has docs`, async ({
    page,
    request,
  }) => {
    // arrange
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.upsertDoc,
      }),
      {
        form: {
          email: getTestEmail(user),
          sourcePublicId,
        } satisfies TestActionRequest,
      },
    );
    // act
    await page.goto(appRoutes("/"));

    // assert
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/My Docs/);
  });
});
