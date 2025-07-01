import { test } from "@playwright/test";
import { setAuthStoragePath } from "e2e/utils/setAuthStoragePath";
import { TEST_USERS } from "~/types/testUsers";

test.describe("New Docs via URL", () => {
  test.use({ storageState: setAuthStoragePath(TEST_USERS.has_docs) });

  test.fixme("allows for adding many urls, comma-separated", async () => {});

  test.fixme("allows for adding many urls, new line", async () => {});
});
