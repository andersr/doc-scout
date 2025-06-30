import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { dragAndDropFile } from "e2e/helpers/dragAndDropFile";
import { MOCK_SOURCE } from "e2e/mocks/sources/mockSource";
import { setAuthStoragePath } from "e2e/utils/setAuthStoragePath";
import { DROPZONE_ID } from "~/config/files";
import { appRoutes } from "~/shared/appRoutes";
import { TEST_KEYS } from "~/shared/testKeys";
import type { TestActionRequest } from "~/types/testActions";
import { TEST_USERS } from "~/types/testUsers";

test.describe("New Docs via File", () => {
  test.use({ storageState: setAuthStoragePath(TEST_USERS.no_docs) });
  let sourcePublicId: string | undefined = "";

  test("allows for adding a single file via drag and drop", async ({
    page,
  }) => {
    // arrange
    const fileName = `${faker.system.fileName({
      extensionCount: 0,
    })}.pdf`;

    // act
    await page.goto(appRoutes("/docs/new"));
    await dragAndDropFile(page, {
      fileName,
      filePath: "./e2e/mocks/files/mockFile.pdf",
      mimeType: "application/pdf",
      selector: `#${DROPZONE_ID}`,
    });

    // assert
    await expect(page.getByText(fileName)).toBeVisible();
  });

  test.fixme(
    "allows for adding many files via drag and drop",
    async ({ page }) => {
      // arrange
      const fileName = `${faker.system.fileName({
        extensionCount: 0,
      })}.pdf`;

      // act
      await page.goto(appRoutes("/docs/new"));
      await dragAndDropFile(page, {
        fileName,
        filePath: "./e2e/mocks/files/mockFile.pdf",
        mimeType: "application/pdf",
        selector: `#${DROPZONE_ID}`,
      });

      // assert
      await expect(page.getByText(fileName)).toBeVisible();
    },
  );

  test("Redirects to doc details after processing a single document", async ({
    page,
    request,
  }) => {
    //TODO: Re-use actions from above test
    // arrange
    const fileName = `${faker.system.fileName({
      extensionCount: 0,
    })}.pdf`;

    await page.route(
      `https://*.s3.*.amazonaws.com/users/**/*`,
      async (route) => {
        const json = {
          filesInfo: [
            {
              fileName,
              signedUrl: "https://foo",
              sourcePublicId: MOCK_SOURCE.publicId,
              storagePath: MOCK_SOURCE.storagePath,
            },
          ],
        };
        await route.fulfill({ json });
      },
    );

    // act
    await page.goto(appRoutes("/docs/new"));
    await dragAndDropFile(page, {
      fileName,
      filePath: "./e2e/mocks/files/mockFile.pdf",
      mimeType: "application/pdf",
      selector: `#${DROPZONE_ID}`,
    });
    await page.getByRole("button", { name: "Add Docs" }).click();

    // assert
    await expect(page.getByRole("heading", { name: fileName })).toBeVisible();

    const url = page.url();
    const parts = url.split("/");
    sourcePublicId = parts.at(-1);

    if (!sourcePublicId) {
      throw new Error("No source public id, cannot delete.");
    }
    await request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.deleteSource,
      }),
      {
        form: {
          sourcePublicId,
        } satisfies TestActionRequest,
      },
    );
  });

  test.fixme(
    "Redirects to dashboard after processing many documents",
    async ({ page, request }) => {
      //TODO: Re-use actions from above test
      // arrange
      const fileName = `${faker.system.fileName({
        extensionCount: 0,
      })}.pdf`;

      await page.route(
        `https://*.s3.*.amazonaws.com/users/**/*`,
        async (route) => {
          const json = {
            filesInfo: [
              {
                fileName,
                signedUrl: "https://foo",
                sourcePublicId: MOCK_SOURCE.publicId,
                storagePath: MOCK_SOURCE.storagePath,
              },
            ],
          };
          await route.fulfill({ json });
        },
      );

      // act
      await page.goto(appRoutes("/docs/new"));
      await dragAndDropFile(page, {
        fileName,
        filePath: "./e2e/mocks/files/mockFile.pdf",
        mimeType: "application/pdf",
        selector: `#${DROPZONE_ID}`,
      });
      await page.getByRole("button", { name: "Add Docs" }).click();

      // assert
      await expect(page.getByRole("heading", { name: fileName })).toBeVisible();

      const url = page.url();
      const parts = url.split("/");
      sourcePublicId = parts.at(-1);

      if (!sourcePublicId) {
        throw new Error("No source public id, cannot delete.");
      }
      await request.post(
        appRoutes("/e2e/:command", {
          command: TEST_KEYS.deleteSource,
        }),
        {
          form: {
            sourcePublicId,
          } satisfies TestActionRequest,
        },
      );
    },
  );

  test.skip("allows for adding a file via finder/explorer", async ({
    page,
  }) => {
    // expect to be on new docs page
    // click on dropzone
    // select many files, click done
    // click submit
    // expect to see processing
    // expect to see docs list with the added content
  });

  test.skip("allows for removing an added file", async ({ page }) => {
    // expect to be on new docs page
    // click on dropzone
    // select many files, click done
    // click submit
    // expect to see processing
    // expect to see docs list with the added content
  });

  test.skip("displays an error if file is too large", async ({ page }) => {
    // expect to be on new docs page
    // click on dropzone
    // select many files, click done
    // click submit
    // expect to see processing
    // expect to see docs list with the added content
  });
});

test.describe("New Docs via PDf", () => {
  test.skip("allows for adding many pdf files", async ({ page }) => {
    // expect to be on new docs page
    // drag many pdf files
    // expect to see list of added files
    // click submit
    // expect to see processing
    // expect to see docs list with the added content
  });
});

test.describe("New Docs via markdown", () => {
  test.skip("allows for adding many markdown files", async ({ page }) => {
    // expect to be on new docs page
    // drag many pdf files
    // expect to see list of added files
    // click submit
    // expect to see processing
    // expect to see docs list with the added content
  });
});
