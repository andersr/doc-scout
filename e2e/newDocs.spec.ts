import { test } from "@playwright/test";

test.describe("New Docs via File", () => {
  test.skip(`allows for adding many files via drag and drop`, async ({
    page,
  }) => {
    // expect to be on new docs page
    // drag many pdf files
    // expect to see list of added files
    // click submit
    // expect to see processing
    // expect to see docs list with the added content
  });

  test.skip(`allows for adding many files via finder/explorer`, async ({
    page,
  }) => {
    // expect to be on new docs page
    // click on dropzone
    // select many files, click done
    // click submit
    // expect to see processing
    // expect to see docs list with the added content
  });

  test.skip(`allows for removing an added file`, async ({ page }) => {
    // expect to be on new docs page
    // click on dropzone
    // select many files, click done
    // click submit
    // expect to see processing
    // expect to see docs list with the added content
  });

  test.skip(`displays an error if file is too large`, async ({ page }) => {
    // expect to be on new docs page
    // click on dropzone
    // select many files, click done
    // click submit
    // expect to see processing
    // expect to see docs list with the added content
  });
});

test.describe("New Docs via PDf", () => {
  test.skip(`allows for adding many pdf files`, async ({ page }) => {
    // expect to be on new docs page
    // drag many pdf files
    // expect to see list of added files
    // click submit
    // expect to see processing
    // expect to see docs list with the added content
  });
});

test.describe("New Docs via markdown", () => {
  test.skip(`allows for adding many markdown files`, async ({ page }) => {
    // expect to be on new docs page
    // drag many pdf files
    // expect to see list of added files
    // click submit
    // expect to see processing
    // expect to see docs list with the added content
  });
});

test.describe("New Docs via URL", () => {
  test.skip(`allows for adding many urls, comma-separated`, async ({
    page,
  }) => {
    // expect to be on new docs page
    // click on url tab
    // pasted multiple comma-separated urls
    // click submit
    // expect to see processing
    // expect to see docs list with the added url content
  });

  test.skip(`allows for adding many urls, new line`, async ({ page }) => {
    // expect to be on new docs page
    // click on url tab
    // pasted multiple urls each on a new line
    // click submit
    // expect to see processing
    // expect to see docs list with the added url content
  });
});
