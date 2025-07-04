import { appRoutes } from "@app/shared/appRoutes";
import { TestUserNames } from "@e2e/types/testUsers";
import { setAuthStoragePath } from "@e2e/utils/setAuthStoragePath";
import { upsertTestUser } from "@e2e/utils/upsertTestUsers";
import { test as setup } from "@playwright/test";
import { getTestEmail } from "e2e/utils/getTestEmail";
const port = process.env.PORT;

setup("test users setup", async ({ request }) => {
  if (!port) {
    throw new Error("No port env var found");
  }

  for await (const userName of TestUserNames) {
    await upsertTestUser(userName);

    const storagePath = setAuthStoragePath(userName);

    // TODO: move to a command
    const loginRoute = appRoutes("/e2e/login", {
      email: getTestEmail(userName),
    });

    await request.post(`http://localhost:${port}${loginRoute}`);

    await request.storageState({ path: storagePath });
  }
});
