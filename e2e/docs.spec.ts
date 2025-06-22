import { expect, test } from "@playwright/test";
import { MOCK_SOURCE } from "../app/__mocks__/sources";
import { TestActionRequest } from "../app/__test__/actions";
import { TEST_KEYS } from "../app/__test__/keys";
import { UpsertSourceInput } from "../app/__test__/schemas";
import { getTestEmail, TEST_USERS } from "../app/__test__/users";
import { appRoutes } from "../app/shared/appRoutes";
import { setAuthStoragePath } from "./utils/setAuthStoragePath";

const user = TEST_USERS.hasDocCreateChat;
const sourcePublicId = "docsStartNewChat";
let chatPublicId = "";

test.describe("Docs - Start new chat", () => {
  test.use({ storageState: setAuthStoragePath(user) });

  test.beforeEach(async ({ request }) => {
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.upsertDoc,
      }),
      {
        form: {
          sourcePublicId,
          username: getTestEmail(user),
        } satisfies UpsertSourceInput,
      },
    );
  });

  test.afterEach(async ({ page, request }, testInfo) => {
    // console.log(
    //   `Finished test: ${testInfo.title} with status: ${testInfo.status}`,
    // );
    if (testInfo.status !== "passed") {
      await page.screenshot({
        path: `screenshots/${testInfo.title.replace(/\s/g, "-")}-failure.png`,
      });
    }
    if (!chatPublicId) {
      throw new Error("no chat public id, cannot delete");
    }
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.deleteChat,
      }),
      {
        form: {
          chatPublicId,
        } satisfies TestActionRequest,
      },
    );
  });

  test(`allows for starting a new chat from doc details`, async ({ page }) => {
    await page.goto(
      appRoutes("/docs/:id", {
        id: sourcePublicId,
      }),
    );

    await expect(
      page.getByRole("heading", { level: 1, name: MOCK_SOURCE.title }),
    ).toBeVisible();
    // TODO: set "New Doc Chat" as a config and import
    await page.getByRole("button", { name: "New Doc Chat" }).click();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: `Chat with "${MOCK_SOURCE.title}"`,
      }),
    ).toBeVisible();
    // TODO: turn into util
    const currentUrl = page.url();
    const parts = currentUrl.split("/");
    const publicId = parts[parts.length - 1];
    chatPublicId = publicId;
  });
});
