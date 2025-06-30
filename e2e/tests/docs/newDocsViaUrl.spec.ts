import { test } from "@playwright/test";

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
