import { expect, test } from "@playwright/test";
import { appRoutes } from "~/shared/appRoutes";
import { userAuthStorage } from "./helpers";

test.describe("Dashboard", () => {
  test.use({ storageState: userAuthStorage });

  test("allows an auth user to view the dashboard", async ({ page }) => {
    await page.goto(appRoutes("/"));

    await expect(page).toHaveTitle(/Dashboard/);
  });
});
