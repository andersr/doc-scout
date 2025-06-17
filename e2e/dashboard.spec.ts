import { expect, test } from "@playwright/test";

import { TEST_KEYS } from "../app/__test__/keys";
import { getTestEmail, TEST_USERS } from "../app/__test__/users";
import { appRoutes } from "../app/shared/appRoutes";
import { setStoragePath } from "./utils/setStoragePath";

test.describe("Dashboard - No Docs", () => {
  test.use({ storageState: setStoragePath(TEST_USERS.dashboardNoDocs) });
  test(`redirects to New Docs if user ${TEST_USERS.dashboardNoDocs} has NO docs`, async ({
    page,
  }) => {
    await page.goto(appRoutes("/"));
    await expect(page.getByRole("heading")).toHaveText(/Add Docs/);
  });
});

test.describe("Dashboard - Has Docs", () => {
  test.use({ storageState: setStoragePath(TEST_USERS.dashboardHasDocs) });

  test(`redirects to the dashboard if user ${TEST_USERS.dashboardHasDocs} has docs`, async ({
    page,
    request,
  }) => {
    // arrange
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.addDocs,
      }),
      {
        form: {
          username: getTestEmail(TEST_USERS.dashboardHasDocs),
        },
      },
    );

    // act
    await page.goto(appRoutes("/"));

    // assert
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Dashboard/,
    );
  });
});
