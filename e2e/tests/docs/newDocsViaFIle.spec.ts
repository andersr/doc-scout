import { setAuthStoragePath } from "e2e/utils/setAuthStoragePath";
import { appRoutes } from "~/shared/appRoutes";
import { TEST_USERS } from "~/types/testUsers";
import { expect, test } from "../../test.withFixtures";

test.describe("New Docs via File", () => {
  test.use({ storageState: setAuthStoragePath(TEST_USERS.no_docs) });
  // const sourcePublicId: string | undefined = "";

  test("allows for adding a single file via drag and drop", async ({
    fileFactory,
    page,
  }) => {
    // arrange
    const pdfFile = fileFactory.newMockFile("pdf");

    // act
    await page.goto(appRoutes("/docs/new"));
    await pdfFile.dragAndDrop();

    // assert
    await expect(page.getByText(pdfFile.getFilename())).toBeVisible();
  });

  test("allows for adding many files via drag and drop", async ({
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

  // test("Redirects to doc details after processing a single document", async ({
  //   page,
  //   request,
  // }) => {
  //   //TODO: Re-use actions from above test
  //   // arrange
  //   const fileName = `${faker.system.fileName({
  //     extensionCount: 0,
  //   })}.pdf`;

  //   await page.route(
  //     `https://*.s3.*.amazonaws.com/users/**/*`,
  //     async (route) => {
  //       const json = {
  //         filesInfo: [
  //           {
  //             fileName,
  //             signedUrl: "https://foo",
  //             sourcePublicId: MOCK_SOURCE.publicId,
  //             storagePath: MOCK_SOURCE.storagePath,
  //           },
  //         ],
  //       };
  //       await route.fulfill({ json });
  //     },
  //   );

  //   // act
  //   await page.goto(appRoutes("/docs/new"));
  //   await dragAndDropFile(page, {
  //     fileName,
  //     filePath: "./e2e/mocks/files/mockFile.pdf",
  //     mimeType: "application/pdf",
  //     selector: `#${DROPZONE_ID}`,
  //   });
  //   await page.getByRole("button", { name: "Add Docs" }).click();

  //   // assert
  //   await expect(page.getByRole("heading", { name: fileName })).toBeVisible();

  //   const url = page.url();
  //   const parts = url.split("/");
  //   sourcePublicId = parts.at(-1);

  //   if (!sourcePublicId) {
  //     throw new Error("No source public id, cannot delete.");
  //   }
  //   await request.post(
  //     appRoutes("/e2e/:command", {
  //       command: TEST_KEYS.deleteSource,
  //     }),
  //     {
  //       form: {
  //         sourcePublicId,
  //       } satisfies TestActionRequest,
  //     },
  //   );
  // });

  // test.fixme(
  //   "Redirects to dashboard after processing many documents",
  //   async ({ page, request }) => {
  //     //TODO: Re-use actions from above test
  //     // arrange
  //     const fileName = `${faker.system.fileName({
  //       extensionCount: 0,
  //     })}.pdf`;

  //     await page.route(
  //       `https://*.s3.*.amazonaws.com/users/**/*`,
  //       async (route) => {
  //         const json = {
  //           filesInfo: [
  //             {
  //               fileName,
  //               signedUrl: "https://foo",
  //               sourcePublicId: MOCK_SOURCE.publicId,
  //               storagePath: MOCK_SOURCE.storagePath,
  //             },
  //           ],
  //         };
  //         await route.fulfill({ json });
  //       },
  //     );

  //     // act
  //     await page.goto(appRoutes("/docs/new"));
  //     await dragAndDropFile(page, {
  //       fileName,
  //       filePath: "./e2e/mocks/files/mockFile.pdf",
  //       mimeType: "application/pdf",
  //       selector: `#${DROPZONE_ID}`,
  //     });
  //     await page.getByRole("button", { name: "Add Docs" }).click();

  //     // assert
  //     await expect(page.getByRole("heading", { name: fileName })).toBeVisible();

  //     const url = page.url();
  //     const parts = url.split("/");
  //     sourcePublicId = parts.at(-1);

  //     if (!sourcePublicId) {
  //       throw new Error("No source public id, cannot delete.");
  //     }
  //     await request.post(
  //       appRoutes("/e2e/:command", {
  //         command: TEST_KEYS.deleteSource,
  //       }),
  //       {
  //         form: {
  //           sourcePublicId,
  //         } satisfies TestActionRequest,
  //       },
  //     );
  //   },
  // );

  // test.fixme("allows for adding a file via finder/explorer", async () => {});

  // test.fixme("allows for adding a PDF file", async () => {});

  // test.fixme("allows for adding a markdown file", async () => {});

  // test.fixme("allows for removing an added file", async () => {});

  // test.fixme("displays an error if file is too large", async () => {});

  // test.fixme("displays an error if file is an invalid format", async () => {});

  // test.fixme("displays an error if too many files are added", async () => {});
});
