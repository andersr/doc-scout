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

const username = TEST_USERS.has_docs;
let sourcePublicId = "";

test.describe("Doc Chat", () => {
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
    await expect(
      page.locator("span").filter({ hasText: expectedInput }),
    ).toBeVisible();

    await expect(
      page.locator("span").filter({ hasText: expectedReply }),
    ).toBeVisible();
  });
});
