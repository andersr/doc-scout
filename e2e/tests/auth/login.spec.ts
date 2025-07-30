import { appRoutes } from "@app/shared/appRoutes";
import { expect, test } from "@playwright/test";

test.describe("Login", () => {
  // test.describe.configure({ retries: 2 });
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

  test("shows success message when submitting valid email", async ({
    page,
  }) => {
    // Use an email that's in the ALLOWED_USERS list from .env.test
    const validEmail = "allowed@user.com";

    await page.goto(appRoutes("/login"));

    const emailInput = page.getByRole("textbox", { name: "Email" });
    await emailInput.fill(validEmail);

    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByText(`Please check the inbox for ${validEmail}`),
    ).toBeVisible();
  });

  test.fixme("allows for signing in with an email address", async () => {});
});
