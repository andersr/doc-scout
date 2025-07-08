import { FILE_CONFIG } from "@app/config/files";
import { appRoutes } from "@app/shared/appRoutes";
import {
  MOCK_FILEPATHS,
  PDF_MOCKFILE_NAME,
} from "@e2e/fixtures/MockFileFactory";
import { TEST_USERS } from "@e2e/types/testUsers";
import { setAuthStoragePath } from "@e2e/utils/setAuthStoragePath";
import { expect, test } from "../../test.withFixtures";

test.describe("Add/Remove Docs", () => {
  test.use({ storageState: setAuthStoragePath(TEST_USERS.new_docs_add_files) });

  test("allows for adding files via drag and drop", async ({
    fileFactory,
    page,
  }) => {
    // arrange
    const pdfFile1 = fileFactory.newMockFile("pdf");
    const pdfFile2 = fileFactory.newMockFile("pdf");

    // act
    await page.goto(appRoutes("/docs/new"));
    await pdfFile1.dragAndDrop();
    await pdfFile2.dragAndDrop();

    // assert
    await expect(page.getByText(pdfFile1.getFilename())).toBeVisible();
    await expect(page.getByText(pdfFile2.getFilename())).toBeVisible();
  });

  test("allows for adding a file via finder/explorer", async ({ page }) => {
    // arrange
    const fileChooserPromise = page.waitForEvent("filechooser");

    // act
    await page.goto(appRoutes("/docs/new"));
    await page.getByRole("button", { name: "File upload area" }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(MOCK_FILEPATHS["pdf"]);

    // assert
    await expect(page.getByText(PDF_MOCKFILE_NAME)).toBeVisible();
  });

  test("allows for removing an added file", async ({ fileFactory, page }) => {
    // arrange
    const pdfFile1 = fileFactory.newMockFile("pdf");

    // act
    await page.goto(appRoutes("/docs/new"));
    await pdfFile1.dragAndDrop();
    await expect(page.getByText(pdfFile1.getFilename())).toBeVisible();
    await page.getByRole("button", { name: "Remove item" }).click();

    // assert
    await expect(page.getByText(pdfFile1.getFilename())).toBeHidden();
  });
});

test.describe("Docs Validation", () => {
  test.use({ storageState: setAuthStoragePath(TEST_USERS.new_docs_validate) });

  test.fixme(
    "displays an error if file is too large",
    async ({ fileFactory, page }) => {
      // arrange
      const badFile = fileFactory.newMockFile("xcf");

      // act
      await page.goto(appRoutes("/docs/new"));
      await badFile.dragAndDrop();

      // assert
      await expect(
        page.getByText(`${badFile.getFilename()}: Invalid file type.`),
      ).toBeVisible();
    },
  );

  test("displays an error if file is invalid type", async ({
    fileFactory,
    page,
  }) => {
    // arrange
    const xcfFile = fileFactory.newMockFile("xcf");

    // act
    await page.goto(appRoutes("/docs/new"));
    await xcfFile.dragAndDrop();

    // assert
    await expect(page.getByText("Invalid file type.")).toBeVisible();
  });

  test.fixme(
    "displays an error if too many files are added",
    async ({ fileFactory, page }) => {
      // arrange
      const files = [];

      for (let index = 0; index < FILE_CONFIG.maxFiles + 1; index++) {
        const file = fileFactory.newMockFile("md");
        files.push(file);
      }

      // act
      await page.goto(appRoutes("/docs/new"));
      files.forEach(async (f) => {
        await f.dragAndDrop();
      });

      // assert
      await expect(page.getByRole("alert")).toBeVisible();
    },
  );
});

test.describe("New Docs Redirect - single doc", () => {
  test.describe.configure({ retries: 2 });
  test.use({
    storageState: setAuthStoragePath(TEST_USERS.new_docs_redirect),
  });

  test("Redirects to doc details after processing a single document", async ({
    apiRequest,
    fileFactory,
    page,
  }) => {
    // arrange
    const pdfFile = fileFactory.newMockFile("pdf");
    await apiRequest.mockStorageRoute([pdfFile.getFilename()]);

    // act
    await page.goto(appRoutes("/docs/new"));
    pdfFile.dragAndDrop();
    await page.getByRole("button", { name: "Add Docs" }).click();

    // assert
    await expect(
      page.getByRole("heading", { name: pdfFile.getFilename() }),
    ).toBeVisible();

    // teardown
    await apiRequest.deleteDocsByName([pdfFile.getFilename()]);
  });
});

test.describe("New Docs Redirect - multiple docs", () => {
  test.describe.configure({ retries: 2 });
  test.use({
    storageState: setAuthStoragePath(TEST_USERS.new_docs_redirect_multidoc),
  });

  test("Redirects to dashboard after processing multiple documents", async ({
    apiRequest,
    fileFactory,
    page,
  }) => {
    // arrange
    const pdfFile1 = fileFactory.newMockFile("pdf");
    const pdfFile2 = fileFactory.newMockFile("pdf");
    await apiRequest.mockStorageRoute([
      pdfFile1.getFilename(),
      pdfFile2.getFilename(),
    ]);

    // act
    await page.goto(appRoutes("/docs/new"));
    await pdfFile1.dragAndDrop();
    await pdfFile2.dragAndDrop();
    await page.getByRole("button", { name: "Add Docs" }).click();

    // assert
    await expect(page.getByRole("heading", { name: "My Docs" })).toBeVisible();

    // teardown
    await apiRequest.deleteDocsByName([
      pdfFile1.getFilename(),
      pdfFile2.getFilename(),
    ]);
  });
});
