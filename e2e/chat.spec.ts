import { expect, test } from "@playwright/test";
import type { CreateChatInput } from "../app/routes/e2e.$command/utils/schemas";
import { appRoutes } from "../app/shared/appRoutes";
import { TEST_KEYS } from "../app/shared/testKeys";
import type { TestActionResponse } from "../app/types/testActions";
import { TEST_USERS } from "../app/types/testUsers";
import { generateTestId } from "./utils/generateTestId";
import { getTestEmail } from "./utils/getTestEmail";
import { setAuthStoragePath } from "./utils/setAuthStoragePath";

const user = TEST_USERS.hasDocCreateChat;

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
          email: getTestEmail(user),
          sourcePublicId: generateTestId(),
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

    if (!chatId) {
      throw new Error("No chat id");
    }
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
