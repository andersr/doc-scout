import { generateId } from "@app/.server/utils/generateId";
import type {
  DeleteMessagesInput,
  UpsertSourceInput,
} from "@app/routes/e2e.$command/utils/e2eSchemas";
import { appRoutes } from "@app/shared/appRoutes";
import { TEST_KEYS } from "@app/shared/testKeys";
import { MOCK_SOURCE } from "@e2e/mocks/sources/mockSource";
import { TEST_USERS } from "@e2e/types/testUsers";
import { getTestEmail } from "@e2e/utils/getTestEmail";
import { setAuthStoragePath } from "@e2e/utils/setAuthStoragePath";
import { expect, test } from "@playwright/test";

test.describe("Doc Chat - bot reply", () => {
  const username = TEST_USERS.chat_bot_reply;
  let botReplySourceId = "";
  test.describe.configure({ retries: 2 });
  test.use({ storageState: setAuthStoragePath(username) });

  test.beforeEach(async ({ request }) => {
    botReplySourceId = generateId();
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.upsertDoc,
      }),
      {
        form: {
          email: getTestEmail(username),
          sourcePublicId: botReplySourceId,
        } satisfies UpsertSourceInput,
      },
    );
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.deleteMessages,
      }),
      {
        form: {
          sourcePublicId: botReplySourceId,
        } satisfies DeleteMessagesInput,
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
          sourcePublicId: botReplySourceId,
        } satisfies DeleteMessagesInput,
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
        id: botReplySourceId,
      }),
    );
    await page.getByRole("textbox", { name: "Message" }).fill(expectedInput);
    await page.getByRole("button", { name: "arrow_upward" }).click();

    await expect(
      page.getByRole("heading", { level: 1, name: MOCK_SOURCE.title }),
    ).toBeVisible();

    // assert
    await page
      .getByRole("alert", { name: "loading" })
      .waitFor({ state: "hidden" });
    await expect(page.getByText(expectedInput)).toBeVisible();
    await expect(page.getByText(expectedReply)).toBeVisible();
  });
});

// TODO: replace repeating steps with a fixture
test.describe("Doc Chat - copy to clipboard", () => {
  test.describe.configure({ retries: 2 });
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
        } satisfies DeleteMessagesInput,
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
        } satisfies DeleteMessagesInput,
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
