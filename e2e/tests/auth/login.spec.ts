import { appRoutes } from "@app/shared/appRoutes";
import { expect, test } from "@playwright/test";

test.describe("Login", () => {
  test.describe.configure({ retries: 2 });
  test.use({ storageState: { cookies: [], origins: [] } });
  test("redirects unauthorized users to request access page", async ({
    page,
  }) => {
    // act
    await page.goto(appRoutes("/login"));
    await page.getByRole("textbox", { name: "Email" }).fill("foo@bar.com");
    await page.getByRole("button", { name: "Continue" }).click();

    // assert
    await expect(
      page.getByRole("heading", { name: "Please Request Access" }),
    ).toBeVisible();
  });

  test.fixme("allows for signing in with an email address", async () => {});
});
