import { expect, test } from "@playwright/test";
import { TestActionResponse } from "../app/__test__/actions";
import { TEST_KEYS } from "../app/__test__/keys";
import { CreateChatInput } from "../app/__test__/schemas";
import { getTestEmail, TEST_USERS } from "../app/__test__/users";
import { appRoutes } from "../app/shared/appRoutes";
import { setAuthStoragePath } from "./utils/setAuthStoragePath";

const user = TEST_USERS.hasDocCreateChat;
const sourcePublicId = "docsAskChatQuestion"; // TODO: define all static test ids in one place to ensure uniqueness

test.describe("Chat", () => {
  test.use({ storageState: setAuthStoragePath(user) });

  let chatId: string | undefined = "";

  test.beforeEach(async ({ request }) => {
    const res = await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.createChat,
      }),
      {
        form: {
          sourcePublicId,
          username: getTestEmail(user),
        } satisfies CreateChatInput,
      },
    );
    const { chatPublicId } = (await res.json()) as TestActionResponse;
    chatId = chatPublicId;
  });

  test.afterEach(async ({ page, request }, testInfo) => {
    if (testInfo.status !== "passed") {
      await page.screenshot({
        path: `e2e/screenshots/${testInfo.title.replace(/\s/g, "-")}-failure.png`,
      });
    }

    if (!chatId) {
      console.warn("no chat id, cannot delete");
    }

    if (chatId) {
      await request.post(
        appRoutes("/e2e/:command", {
          command: TEST_KEYS.deleteChat,
        }),
        {
          form: {
            chatPublicId: chatId,
          },
        },
      );
    }
  });

  test(`allows for asking a question and getting a response`, async ({
    page,
  }) => {
    // arrange
    const expectedInput = "How did the hawk use traffic to hunt?";
    const expectedReply = "BOT REPLY";
    await page.goto(
      appRoutes("/chats/:id", {
        id: chatId,
      }),
    );

    // act
    await page.getByRole("textbox", { name: "Message" }).fill(expectedInput);
    await page.getByRole("button", { name: "arrow_upward" }).click();

    // assert
    await expect(
      page.locator("span").filter({ hasText: expectedInput }),
    ).toBeVisible();

    await expect(
      page.locator("span").filter({ hasText: expectedReply }),
    ).toBeVisible();
  });
});
