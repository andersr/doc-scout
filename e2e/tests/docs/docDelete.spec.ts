import { generateId } from "@app/.server/utils/generateId";
import { ADD_DOCS_TITLE } from "@app/config/titles";
import type {
  DeleteAllUserSourcesInput,
  UpsertSourceInput,
} from "@app/routes/e2e.$command/utils/e2eSchemas";
import { appRoutes } from "@app/shared/appRoutes";
import { TEST_KEYS } from "@app/shared/testKeys";
import { MOCK_SOURCE } from "@e2e/mocks/sources/mockSource";
import { TEST_USERS } from "@e2e/types/testUsers";
import { getTestEmail } from "@e2e/utils/getTestEmail";
import { setAuthStoragePath } from "@e2e/utils/setAuthStoragePath";
import { expect, test } from "@playwright/test";

test.describe("Doc delete", () => {
  const username = TEST_USERS.doc_delete;
  let sourcePublicId = "";
  test.use({ storageState: setAuthStoragePath(username) });

  test.beforeEach(async ({ request }) => {
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.deleteAllUserSources,
      }),
      {
        form: {
          email: getTestEmail(username),
        } satisfies DeleteAllUserSourcesInput,
      },
    );

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
  });

  test("deletes doc with confirmation dialog", async ({ page }) => {
    // arrange
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toBe(`Delete "${MOCK_SOURCE.title}"?`);
      await dialog.accept();
    });

    // act
    await page.goto(
      appRoutes("/docs/:id", {
        id: sourcePublicId,
      }),
    );
    await page.getByRole("button", { name: "Delete Doc" }).click();

    // assert
    await expect(
      page.getByRole("heading", { level: 1, name: ADD_DOCS_TITLE }),
    ).toBeVisible();
  });
});
