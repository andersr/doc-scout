import { expect, test } from "@playwright/test";
import { appRoutes } from "../app/shared/appRoutes";
import { userAuthStorage } from "./helpers";

test.describe("Dashboard", () => {
  test.use({ storageState: userAuthStorage });

  test("redirects to the new docs form if a user has no docs", async ({
    page,
  }) => {
    await page.goto(appRoutes("/"));
    await expect(page.getByRole("heading")).toHaveText(/Add Docs/);
  });
});
