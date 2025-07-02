import { expect, test } from "@playwright/test";
import { generateId } from "~/.server/utils/generateId";
import type { TestActionRequest } from "~/types/testActions";
import type { UpsertSourceInput } from "../../../app/routes/e2e.$command/utils/e2eSchemas";
import { appRoutes } from "../../../app/shared/appRoutes";
import { TEST_KEYS } from "../../../app/shared/testKeys";
import { TEST_USERS } from "../../../app/types/testUsers";
import { MOCK_SOURCE } from "../../mocks/sources/mockSource";
import { getTestEmail } from "../../utils/getTestEmail";
import { setAuthStoragePath } from "../../utils/setAuthStoragePath";

test.describe("Doc Chat - bot reply", () => {
  const username = TEST_USERS.chat_bot_reply;
  let sourcePublicId = "";
  test.use({ storageState: setAuthStoragePath(username) });

  test.beforeEach(async ({ request }) => {
    sourcePublicId = generateId();
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.upsertDoc,
      }),
      {
        form: {
          email: getTestEmail(username),
          sourcePublicId,
        } satisfies UpsertSourceInput,
      },
    );
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.deleteMessages,
      }),
      {
        form: {
          sourcePublicId,
        } satisfies TestActionRequest,
      },
    );
  });

  test.afterEach(async ({ request }) => {
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.deleteMessages,
      }),
      {
        form: {
          sourcePublicId,
        } satisfies TestActionRequest,
      },
    );
  });

  test("allows for asking a question and getting a bot response", async ({
    page,
  }) => {
    // arrange
    const expectedInput = "Fake bot question";
    const expectedReply = "BOT REPLY";

    // act
    await page.goto(
      appRoutes("/docs/:id", {
        id: sourcePublicId,
      }),
    );
    await page.getByRole("textbox", { name: "Message" }).fill(expectedInput);
    await page.getByRole("button", { name: "arrow_upward" }).click();

    await expect(
      page.getByRole("heading", { level: 1, name: MOCK_SOURCE.title }),
    ).toBeVisible();

    // assert
    await expect(page.getByText(expectedInput)).toBeVisible();
    await expect(page.getByText(expectedReply)).toBeVisible();
  });
});

test.describe("Doc Chat - copy to clipboard", () => {
  const username = TEST_USERS.chat_copy_clipboard;
  let sourcePublicId = "";
  test.use({
    permissions: ["clipboard-write", "clipboard-read"],
    storageState: setAuthStoragePath(username),
  });

  test.beforeEach(async ({ request }) => {
    sourcePublicId = generateId();
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.upsertDoc,
      }),
      {
        form: {
          email: getTestEmail(username),
          sourcePublicId,
        } satisfies UpsertSourceInput,
      },
    );
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.deleteMessages,
      }),
      {
        form: {
          sourcePublicId,
        } satisfies TestActionRequest,
      },
    );
  });

  test.afterEach(async ({ request }) => {
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.deleteMessages,
      }),
      {
        form: {
          sourcePublicId,
        } satisfies TestActionRequest,
      },
    );
  });

  test("allows for copying bot response to clipboard", async ({ page }) => {
    // arrange
    const expectedInput = "Fake bot question";
    const expectedReply = "BOT REPLY";

    // act
    await page.goto(
      appRoutes("/docs/:id", {
        id: sourcePublicId,
      }),
    );
    await page.getByRole("textbox", { name: "Message" }).fill(expectedInput);
    await page.getByRole("button", { name: "arrow_upward" }).click();

    await expect(
      page.getByRole("heading", { level: 1, name: MOCK_SOURCE.title }),
    ).toBeVisible();

    // assert
    await expect(
      page.locator("span").filter({ hasText: expectedReply }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Copy to clipboard" }).click();
    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(clipboardText).toBe(expectedReply);
  });
});
