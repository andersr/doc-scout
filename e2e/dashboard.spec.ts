import { expect, test } from "@playwright/test";

import { TestActionRequest } from "../app/__test__/actions";
import { TEST_KEYS } from "../app/__test__/keys";
import { getTestEmail, TEST_USERS } from "../app/__test__/users";
import { appRoutes } from "../app/shared/appRoutes";
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
          sourcePublicId,
          username: getTestEmail(user),
        } satisfies TestActionRequest,
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

// test.describe("Dashboard - Recent Items", () => {
//   test.use({ storageState: setStoragePath(TEST_USERS.hasDocs) });

//   test.fixme(`Diplays recent docs`, async ({ page, request }) => {
//     // act
//     await page.goto(appRoutes("/"));

//     // assert
//     await expect(page.getByRole("heading", { level: 1 })).toHaveText(
//       /Dashboard/,
//     );
//   });

//   test.fixme(`Diplays recent chats`, async ({ page, request }) => {
//     // act
//     await page.goto(appRoutes("/"));

//     // assert
//     await expect(page.getByRole("heading", { level: 1 })).toHaveText(
//       /Dashboard/,
//     );
//   });
// });
