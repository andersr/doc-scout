import {
  MOCK_FILEPATHS,
  PDF_MOCKFILE_NAME,
} from "e2e/fixtures/MockFileFactory";
import { setAuthStoragePath } from "e2e/utils/setAuthStoragePath";
import { appRoutes } from "~/shared/appRoutes";
import { TEST_USERS } from "~/types/testUsers";
import { expect, test } from "../../test.withFixtures";

test.describe("Add/Remove Docs", () => {
  test.use({ storageState: setAuthStoragePath(TEST_USERS.has_docs) });

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

// test.describe("Docs Validation", () => {
//   test.use({ storageState: setAuthStoragePath(TEST_USERS.has_docs) });
//   test.fixme("allows for adding a file via finder/explorer", async () => {});

//   test.fixme("allows for adding a PDF file", async () => {});

//   test.fixme("allows for adding a markdown file", async () => {});

//   test.fixme("allows for removing an added file", async () => {});

//   test.fixme("displays an error if file is too large", async () => {});

//   test.fixme("displays an error if file is an invalid format", async () => {});

//   test.fixme("displays an error if too many files are added", async () => {});
// });

test.describe("New Docs Redirect - single doc", () => {
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
