import { test as setup } from "@playwright/test";
import {
  getTestEmail,
  TEST_USER_PWD,
  TestUserNames,
} from "../app/__test__/users";
import { appRoutes } from "../app/shared/appRoutes";
import { setStoragePath } from "./utils/setStoragePath";
const port = process.env.PORT;

setup("authenticate test users", async ({ request }) => {
  if (!port) {
    throw new Error("No port env var found");
  }
  for await (const userName of TestUserNames) {
    const storagePath = setStoragePath(userName);

    const loginRoute = appRoutes("/e2e/login", {
      email: getTestEmail(userName),
      password: TEST_USER_PWD,
    });

    await request.post(`http://localhost:${port}${loginRoute}`);

    await request.storageState({ path: storagePath });
  }
});
